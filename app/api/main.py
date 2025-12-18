import cv2
import pickle
import cvzone
import numpy as np
import requests
import time

# ===== Load parking spaces (ID + pos + size) =====
with open("ParkingData.pkl", "rb") as f:
    parkingSpaces = pickle.load(f)

# Video source
cap = cv2.VideoCapture("carPark.mp4")  # или 0 для камеры

# API URL
API_URL = "http://127.0.0.1:8080/update"

# Отправка каждые N секунд
SEND_INTERVAL = 2
last_send_time = 0

# Переменная для паузы
is_paused = False


def check_space(img_gray, pos, w, h, thresh=900):
    x, y = pos
    img_crop = img_gray[y:y + h, x:x + w]
    count = cv2.countNonZero(img_crop)
    return count < thresh, count  # (isFree, pixel_count)


# Читаем первый кадр, чтобы переменная img существовала до начала цикла
success, img = cap.read()

while True:
    # --- 1. Обработка клавиш (перенесли в начало) ---
    key = cv2.waitKey(10) & 0xFF
    if key == 27:  # ESC
        break
    elif key == ord('p'):  # P - пауза
        is_paused = not is_paused

    # --- 2. Если НЕ ПАУЗА: читаем, обрабатываем, отправляем API ---
    if not is_paused:
        success, frame_read = cap.read()

        # Если видео кончилось — зацикливаем
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # Обновляем основную картинку
        img = frame_read

        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_blur = cv2.GaussianBlur(img_gray, (5, 5), 1)
        img_thresh = cv2.adaptiveThreshold(
            img_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY_INV, 25, 16
        )

        spots_status = []

        for space in parkingSpaces:
            sid = space["id"]
            x, y = space["pos"]
            w, h = space["w"], space["h"]

            free, count = check_space(img_thresh, (x, y), w, h)

            # Цвета
            color_rect = (0, 255, 0) if free else (0, 0, 255)
            color_number = (0, 255, 0) if free else (0, 0, 255)

            # Rectangle
            cv2.rectangle(img, (x, y), (x + w, y + h), color_rect, 2)

            status_text = "FREE" if free else "BUSY"

            # Номер парковки над статусом
            cvzone.putTextRect(
                img,
                f"#{sid}",
                (x + 5, y + 25),
                scale=1,
                thickness=2,
                offset=5,
                colorT=color_number,
                colorR=(30, 30, 30)
            )

            # FREE / BUSY label
            cvzone.putTextRect(
                img,
                status_text,
                (x + 5, y + 45),
                scale=0.9,
                thickness=2,
                offset=4,
                colorT=(255, 255, 255),
                colorR=color_rect
            )

            spots_status.append({
                "id": sid,
                "status": "free" if free else "busy"
            })

        # Отправка на API (только когда видео идет)
        current_time = time.time()
        if current_time - last_send_time > SEND_INTERVAL:
            try:
                response = requests.post(API_URL, json={"spots": spots_status}, timeout=1.0)
                # Можно добавить print для отладки, если нужно
                # print(f"API Update: {response.status_code}")
            except Exception as e:
                print(f"Не удалось отправить данные: {e}")
            last_send_time = current_time

    # --- 3. Отрисовка (С учетом паузы) ---

    # Делаем копию для показа, чтобы надпись PAUSED не "впекалась" в кадр
    img_display = img.copy()

    if is_paused:
        cvzone.putTextRect(
            img_display,
            "PAUSED",
            (50, 100),
            scale=3,
            thickness=3,
            offset=10,
            colorR=(0, 0, 255)
        )

    cv2.imshow("Smart Parking", img_display)

cap.release()
cv2.destroyAllWindows()