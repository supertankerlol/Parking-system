import cv2
import pickle
import numpy as np

VIDEO_PATH = "video5.mp4"        # твое видео
SAVE_FILE = "polygons.pkl"       # файл сохранения

# Загружаем старые полигоны
try:
    with open(SAVE_FILE, "rb") as f:
        polygons = pickle.load(f)
except:
    polygons = []

current_points = []   # временные точки для одного парковочного места


def mouse_click(event, x, y, flags, params):
    global current_points, polygons

    # --- ЛКМ: Добавляем точку ---
    if event == cv2.EVENT_LBUTTONDOWN:
        current_points.append((x, y))
        print("Point added:", (x, y))

        # 4 точки → одно парковочное место
        if len(current_points) == 4:
            polygons.append(current_points.copy())
            print("🟩 Added parking space:", len(polygons))
            current_points = []

            with open(SAVE_FILE, "wb") as f:
                pickle.dump(polygons, f)

    # --- ПКМ: Удаляем многоугольник ---
    elif event == cv2.EVENT_RBUTTONDOWN:
        for poly in polygons:
            pts = np.array(poly, np.int32)
            if cv2.pointPolygonTest(pts, (x, y), False) >= 0:
                polygons.remove(poly)
                print("❌ Removed parking space")
                with open(SAVE_FILE, "wb") as f:
                    pickle.dump(polygons, f)
                break


def main():
    global polygons

    # Загружаем первый кадр видео
    cap = cv2.VideoCapture(VIDEO_PATH)
    success, frame = cap.read()
    cap.release()

    if not success:
        print("⚠ Не удалось загрузить видео!")
        return

    cv2.namedWindow("Parking Picker")
    cv2.setMouseCallback("Parking Picker", mouse_click)

    while True:
        img = frame.copy()

        # рисуем существующие полигоны
        for idx, poly in enumerate(polygons):
            pts = np.array(poly, np.int32)
            cv2.polylines(img, [pts], True, (255, 0, 255), 2)

            # нумерация парковочных мест
            cx, cy = np.mean(pts[:, 0]), np.mean(pts[:, 1])
            cv2.putText(img, str(idx + 1), (int(cx) - 10, int(cy)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # рисуем временные точки
        for p in current_points:
            cv2.circle(img, p, 5, (0, 255, 0), -1)

        cv2.putText(img,
                    "LMB: add point | 4 points = 1 space | RMB: remove | ESC: exit",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                    (200, 255, 200), 2)

        cv2.imshow("Parking Picker", img)

        key = cv2.waitKey(1)
        if key == 27:   # ESC
            break

    cv2.destroyAllWindows()
    print("✅ Done. Saved:", SAVE_FILE)


if __name__ == "__main__":
    main()
