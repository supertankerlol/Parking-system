import cv2
import cvzone
import numpy as np
import pickle
import os

# ======================
# CONFIGURATION
# ======================

VIDEO_PATH = 'video1.mp4'
PARK_POS_FILE = 'CarParkPos'
PLACE_SIZE = (107, 48)
THRESHOLD_COUNT = 900
TRACKBAR_WINDOW = "Threshold Controls"
FRAME_DELAY = 10

# ======================
# UTILS
# ======================

def load_positions(file_path):
    """Load or initialize parking positions."""
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            return pickle.load(f)
    return []

def save_positions(file_path, positions):
    """Save updated parking positions."""
    with open(file_path, 'wb') as f:
        pickle.dump(positions, f)

# ======================
# INTERACTIVE POSITION EDITOR
# ======================

def edit_positions(image_path, save_file, slot_size=None):
    """
    Редактор парковочных зон — выбор 4 точек для каждого места.
    ЛКМ — добавить точку, 4 точки = одно место.
    ПКМ — удалить место по клику.
    ESC — выйти и сохранить.
    """

    import numpy as np

    posList = load_positions(save_file)
    current_points = []  # временные точки одного места
    SCALE = 0.7  # уменьшает окно до 70% от исходного размера

    def mouse_click(event, x, y, flags, params):
        nonlocal current_points, posList

        # При масштабировании нужно пересчитать координаты
        scaled_x, scaled_y = int(x / SCALE), int(y / SCALE)

        if event == cv2.EVENT_LBUTTONDOWN:
            current_points.append((scaled_x, scaled_y))
            if len(current_points) == 4:
                posList.append(current_points.copy())
                current_points = []
                save_positions(save_file, posList)
                print(f"🟩 Добавлено место №{len(posList)}")

        elif event == cv2.EVENT_RBUTTONDOWN:
            for poly in posList:
                pts = np.array(poly, np.int32)
                if cv2.pointPolygonTest(pts, (scaled_x, scaled_y), False) >= 0:
                    posList.remove(poly)
                    save_positions(save_file, posList)
                    print(f"❌ Удалено место, осталось {len(posList)}")
                    break

    while True:
        img = cv2.imread(image_path)
        if img is None:
            print("⚠️ Не найдено изображение. Проверь путь.")
            break

        # Масштабирование
        img_resized = cv2.resize(img, None, fx=SCALE, fy=SCALE)

        # Отрисовываем сохранённые полигоны (уменьшенные координаты)
        for poly in posList:
            pts = np.array([(int(x * SCALE), int(y * SCALE)) for x, y in poly], np.int32)
            cv2.polylines(img_resized, [pts], True, (255, 0, 255), 2)

        # Временные точки
        for point in current_points:
            cv2.circle(img_resized, (int(point[0] * SCALE), int(point[1] * SCALE)), 5, (0, 255, 0), -1)

        cv2.putText(img_resized, "LMB - add points | RMB - delete polygon | ESC - save & exit",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 255, 200), 2)

        cv2.imshow("Edit Parking Polygons", img_resized)
        cv2.setMouseCallback("Edit Parking Polygons", mouse_click)

        key = cv2.waitKey(1)
        if key == 27:  # ESC
            break

    cv2.destroyAllWindows()
    print(f"✅ Сохранено {len(posList)} парковочных мест в файл '{save_file}'")

# ======================
# PARKING DETECTION
# ======================

def init_trackbars():
    cv2.namedWindow(TRACKBAR_WINDOW)
    cv2.resizeWindow(TRACKBAR_WINDOW, 640, 240)
    cv2.createTrackbar("Adaptive Block", TRACKBAR_WINDOW, 25, 50, lambda a: None)
    cv2.createTrackbar("C Value", TRACKBAR_WINDOW, 16, 50, lambda a: None)
    cv2.createTrackbar("Median Blur", TRACKBAR_WINDOW, 5, 50, lambda a: None)

def get_trackbar_values():
    val1 = cv2.getTrackbarPos("Adaptive Block", TRACKBAR_WINDOW)
    val2 = cv2.getTrackbarPos("C Value", TRACKBAR_WINDOW)
    val3 = cv2.getTrackbarPos("Median Blur", TRACKBAR_WINDOW)
    if val1 % 2 == 0: val1 += 1
    if val3 % 2 == 0: val3 += 1
    return val1, val2, val3

def preprocess_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (3, 3), 1)
    val1, val2, val3 = get_trackbar_values()
    thres = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                  cv2.THRESH_BINARY_INV, val1, val2)
    thres = cv2.medianBlur(thres, val3)
    kernel = np.ones((3, 3), np.uint8)
    return cv2.dilate(thres, kernel, iterations=1)

def check_parking_spaces(frame, img_pro, posList):
    """
    Проверка занятости парковочных мест (по полигонам из 4 точек).
    frame — оригинальное изображение (для отображения)
    img_pro — бинарное изображение (для анализа)
    posList — список полигонов [[(x1, y1), (x2, y2), (x3, y3), (x4, y4)], ...]
    """

    free_spaces = 0

    for poly in posList:
        pts = np.array(poly, np.int32)

        # Создаём маску по форме полигона
        mask = np.zeros(img_pro.shape[:2], np.uint8)
        cv2.fillPoly(mask, [pts], 255)

        # Вырезаем зону парковочного места
        img_crop = cv2.bitwise_and(img_pro, img_pro, mask=mask)

        # Подсчитываем количество белых пикселей (занятость)
        count = cv2.countNonZero(img_crop)

        # Определяем состояние места
        is_free = count < THRESHOLD_COUNT
        color = (0, 200, 0) if is_free else (0, 0, 200)
        thickness = 3 if is_free else 2
        free_spaces += int(is_free)

        # Отрисовываем контур и значение
        cv2.polylines(frame, [pts], True, color, thickness)
        cx, cy = np.mean(pts[:, 0]), np.mean(pts[:, 1])  # центр полигона
        cv2.putText(frame, str(count), (int(cx) - 15, int(cy)), cv2.FONT_HERSHEY_PLAIN, 1, color, 2)

    # Итоговая надпись
    cvzone.putTextRect(frame, f'Free: {free_spaces}/{len(posList)}',
                       (50, 60), thickness=3, offset=20, colorR=(0, 200, 0))

# ======================
# MAIN LOOP
# ======================

def main():
    posList = load_positions(PARK_POS_FILE)
    if not posList:
        print("⚠️ No parking positions found. Run edit_positions() first.")
        return

    init_trackbars()
    cap = cv2.VideoCapture(VIDEO_PATH)

    DISPLAY_SCALE = 0.7  # ← уменьшает окно до 70% от исходного размера
    width, height = PLACE_SIZE

    while True:
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        img_pro = preprocess_frame(frame)
        check_parking_spaces(frame, img_pro, posList)

        # ↓ Масштабируем изображение для экрана
        frame_resized = cv2.resize(frame, None, fx=DISPLAY_SCALE, fy=DISPLAY_SCALE)

        cv2.imshow("Smart Parking", frame_resized)

        if cv2.waitKey(FRAME_DELAY) & 0xFF == 27:  # ESC to stop
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    # 1️⃣ Если нужно размечать места — раскомментируй:
    edit_positions("carParkImg.png", PARK_POS_FILE, PLACE_SIZE)

    # 2️⃣ Для запуска анализа видео:
    #main()
