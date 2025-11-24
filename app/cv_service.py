#!/usr/bin/env python3
# cv_service.py
import os
import time
import json
import logging
import argparse
from pathlib import Path
from datetime import datetime
from collections import deque, defaultdict

import cv2
import numpy as np
import requests
from shapely.geometry import Point, Polygon
from ultralytics import YOLO
from PIL import Image

from dotenv import load_dotenv
import yaml


# ---------- Utils ----------
def ensure_dir(p):
    Path(p).mkdir(parents=True, exist_ok=True)


def now_iso():
    return datetime.utcnow().isoformat() + "Z"


# ---------- CV Service ----------
class ParkingCVService:
    def __init__(self, config_path, positions_path):
        # load config
        with open(config_path, "r") as f:
            self.cfg = yaml.safe_load(f)
        self.backend_url = self.cfg["backend"]["events_endpoint"]
        self.send_events = self.cfg["backend"].get("send_events", True)
        self.snapshots_dir = Path(self.cfg["storage"]["snapshots_dir"])
        ensure_dir(self.snapshots_dir)

        # load positions
        with open(positions_path, "r") as f:
            pos = json.load(f)
        self.spaces = {}
        for s in pos["spaces"]:
            poly = Polygon([tuple(p) for p in s["polygon"]])
            self.spaces[s["id"]] = {
                "label": s.get("label", s["id"]),
                "polygon": poly,
                "state": "UNKNOWN",  # FREE / OCCUPIED / UNKNOWN / RESERVED
            }

        # debounce state per space
        fw = self.cfg["debounce"]["frames_window"]
        self.frames_window = fw
        self.confirm_count = self.cfg["debounce"]["confirm_count"]
        self.release_count = self.cfg["debounce"]["release_count"]
        self.history = {sid: deque(maxlen=fw) for sid in self.spaces.keys()}

        # load YOLO model
        model_name = self.cfg["yolo"]["model"]
        logging.info(f"Loading YOLO model {model_name}...")
        self.model = YOLO(model_name)  # will download if needed

        # detection filters
        self.class_filter = set(self.cfg["detection"].get("class_filter", []))
        self.conf_threshold = float(self.cfg["detection"].get("conf_threshold", 0.35))

        # camera source
        self.camera_id = pos.get("camera_id", self.cfg["camera"]["id"])
        self.source = self.cfg["camera"]["source"]

        # stats
        self.frame_idx = 0

    def run(self, max_frames=None, playback_fps=None):
        # open capture
        cap = cv2.VideoCapture(self.source)
        if not cap.isOpened():
            logging.error(f"Cannot open source {self.source}")
            return

        # if playback_fps specified and source is file, respect it
        while True:
            ret, frame = cap.read()
            if not ret:
                logging.info("Stream ended or can't fetch frame.")
                break
            self.frame_idx += 1
            timestamp = datetime.utcnow()

            # YOLO inference (expects numpy BGR)
            results = self.model(frame, imgsz=640, conf=self.conf_threshold, iou=self.cfg["detection"]["iou_threshold"])
            # results is list; take first
            detections = []
            r = results[0]
            boxes = r.boxes
            for box in boxes:
                cls = int(box.cls.cpu().numpy()[0])
                conf = float(box.conf.cpu().numpy()[0])
                if self.class_filter and cls not in self.class_filter:
                    continue
                xyxy = box.xyxy.cpu().numpy()[0].tolist()  # [x1,y1,x2,y2]
                detections.append({
                    "class": cls,
                    "conf": conf,
                    "bbox": xyxy
                })

            # map detections to occupied spaces
            occupied_spaces = set()
            for det in detections:
                x1, y1, x2, y2 = det["bbox"]
                cx = (x1 + x2) / 2.0
                cy = (y1 + y2) / 2.0
                pt = Point(cx, cy)
                for sid, s in self.spaces.items():
                    if s["polygon"].contains(pt):
                        occupied_spaces.add(sid)

            # update history buffers and decide state transitions
            events = []
            for sid in self.spaces.keys():
                is_occupied = 1 if sid in occupied_spaces else 0
                self.history[sid].append(is_occupied)
                hist = list(self.history[sid])
                # count recent occupied frames
                occ_count = sum(hist)
                # if currently unknown or free and enough occupied detections -> set OCCUPIED
                prev = self.spaces[sid]["state"]
                new_state = prev
                if prev != "OCCUPIED":
                    if occ_count >= self.confirm_count:
                        new_state = "OCCUPIED"
                if prev == "OCCUPIED":
                    # require release_count of zeros to confirm free
                    zeros = len(hist) - occ_count
                    if zeros >= self.release_count:
                        new_state = "FREE"
                if prev == "UNKNOWN" and new_state == "OCCUPIED":
                    # fine
                    pass

                if new_state != prev:
                    # save snapshot
                    snapshot_path = self._save_snapshot(frame, sid, timestamp)
                    event = {
                        "parking_space_id": sid,
                        "camera_id": self.camera_id,
                        "old_status": prev,
                        "new_status": new_state,
                        "detected_at": timestamp.isoformat() + "Z",
                        "snapshot_url": str(snapshot_path),
                        "confidence": float(occ_count) / max(1, len(hist))
                    }
                    events.append(event)
                    # apply new state
                    self.spaces[sid]["state"] = new_state

            # if events: send to backend
            if events:
                payload = {
                    "camera_id": self.camera_id,
                    "timestamp": timestamp.isoformat() + "Z",
                    "events": events
                }
                logging.info(f"Detected events: {events}")
                if self.send_events and self.backend_url:
                    try:
                        resp = requests.post(self.backend_url, json=payload, timeout=5)
                        logging.info(f"Posted events to backend: status {resp.status_code}")
                    except Exception as e:
                        logging.error(f"Failed to post events: {e}")

            # optional: visualization / debug
            self._draw_and_show(frame, detections, occupied_spaces)

            # respect playback fps if provided
            if playback_fps:
                time.sleep(1.0 / playback_fps)

            if max_frames and self.frame_idx >= max_frames:
                break

        cap.release()
        logging.info("CV service stopped.")

    def _save_snapshot(self, frame, space_id, timestamp):
        # frame is BGR numpy
        im = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(im)
        fname = f"{self.camera_id}_{space_id}_{timestamp.strftime('%Y%m%dT%H%M%S')}.jpg"
        outp = self.snapshots_dir / fname
        pil.save(outp, quality=85)
        return outp.resolve()

    def _draw_and_show(self, frame, detections, occupied_spaces):
        # draw polygons and detections
        vis = frame.copy()
        # draw spaces
        for sid, s in self.spaces.items():
            pts = np.array(s["polygon"].exterior.coords, np.int32).reshape((-1, 1, 2))
            color = (0, 255, 0) if s["state"] != "OCCUPIED" else (0, 0, 255)
            cv2.polylines(vis, [pts], isClosed=True, color=color, thickness=2)
            # label
            cx, cy = map(int, s["polygon"].centroid.coords[0])
            cv2.putText(vis, f"{sid}:{s['state']}", (cx - 30, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # draw detections
        for d in detections:
            x1, y1, x2, y2 = map(int, d["bbox"])
            cv2.rectangle(vis, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(vis, f"{d['class']}:{d['conf']:.2f}", (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0),
                        1)

        # show in window (optional; in headless containers you can disable)
        if os.environ.get("SHOW_WINDOW", "1") == "1":
            cv2.imshow("parking-cv", vis)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                logging.info("Quit requested by user.")
                exit(0)


# ---------- CLI ----------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="config.yml")
    parser.add_argument("--positions", default="parking_positions.json")
    parser.add_argument("--max-frames", type=int, default=0)
    parser.add_argument("--playback-fps", type=float, default=0)
    parser.add_argument("--no-send", action="store_true")
    args = parser.parse_args()

    # logging
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

    svc = ParkingCVService(args.config, args.positions)
    if args.no_send:
        svc.send_events = False
    max_frames = args.max_frames or None
    playback = args.playback_fps or None
    svc.run(max_frames=max_frames, playback_fps=playback)


if __name__ == "__main__":
    main()
