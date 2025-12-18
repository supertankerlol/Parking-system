# ParkingPolygonPicker.py
import cv2
import json
from utils import save_polygons, load_polygons

WINDOW = "Parking Polygon Picker"
polygons = load_polygons()  # list of points
current_polygon = []
selected_idx = -1


def draw_polygons(img):
    for i, poly in enumerate(polygons):
        pts = poly
        color = (255, 0, 255) if i == selected_idx else (0, 255, 0)
        pts_np = cv2.array(pts, dtype='int32') if hasattr(cv2, 'array') else None
        # draw polygon
        cv2.polylines(img, [np.array(pts, dtype=int)], isClosed=True, color=color, thickness=2)
        # draw number
        cx = sum([p[0] for p in pts]) // 4
        cy = sum([p[1] for p in pts]) // 4
        cv2.putText(img, str(i + 1), (cx - 10, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)


import numpy as np


def mouse(event, x, y, flags, param):
    global current_polygon, polygons, selected_idx
    if event == cv2.EVENT_LBUTTONDOWN:
        # add point to current polygon
        current_polygon.append((x, y))
        if len(current_polygon) == 4:
            polygons.append(current_polygon.copy())
            current_polygon = []
            save_polygons(polygons)
            print(f"Saved polygon #{len(polygons)}")
    elif event == cv2.EVENT_RBUTTONDOWN:
        # remove polygon if clicked inside it
        for i, poly in enumerate(polygons):
            mask = np.zeros((param.shape[0], param.shape[1]), dtype=np.uint8)
            cv2.fillPoly(mask, [np.array(poly, dtype=np.int32)], 255)
            if mask[y, x] == 255:
                print(f"Removing polygon #{i + 1}")
                polygons.pop(i)
                save_polygons(polygons)
                break


def main():
    global current_polygon
    img_path = 'carParkImg.png'
    img = cv2.imread(img_path)
    if img is None:
        print("Place 'carParkImg.png' (frame snapshot) in project folder.")
        return

    cv2.namedWindow(WINDOW)
    cv2.setMouseCallback(WINDOW, mouse, param=img)

    while True:
        display = img.copy()
        # draw saved polygons
        for i, poly in enumerate(polygons):
            pts = np.array(poly, np.int32)
            cv2.polylines(display, [pts], True, (0, 255, 0), 2)
            cx = sum([p[0] for p in poly]) // 4
            cy = sum([p[1] for p in poly]) // 4
            cv2.putText(display, str(i + 1), (cx - 10, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # draw current polygon in progress
        for p in current_polygon:
            cv2.circle(display, p, 5, (255, 0, 255), -1)
        if len(current_polygon) > 1:
            cv2.polylines(display, [np.array(current_polygon, np.int32)], False, (255, 0, 255), 1)

        cv2.putText(display, "Left-click: add point (4 points per spot). Right-click: remove spot", (10, 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        cv2.imshow(WINDOW, display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'): break
        if key == ord('c'):
            current_polygon = []
            print("Cleared current polygon points.")
        if key == ord('s'):
            save_polygons(polygons)
            print("Saved polygons.")

    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
