import os

APP_DIR = os.path.dirname(os.path.abspath(__file__))

VIDEO_PATH = os.path.join(APP_DIR, "video1.mp4")
PARK_POS_FILE = os.path.join(APP_DIR, "CarParkPos")

THRESHOLD_COUNT = 850
FRAME_SKIP = 1
STABILITY_FRAMES = 5
DISPLAY_SCALE = 0.7

SERVER_URL = "http://localhost:5000/api/parking/update"
UPDATE_COOLDOWN_SECONDS = 0.5
