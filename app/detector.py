import cv2
import numpy as np
import time
from collections import deque
from PM.app.config import (
    THRESHOLD_COUNT, FRAME_SKIP, STABILITY_FRAMES,
    DISPLAY_SCALE, UPDATE_COOLDOWN_SECONDS
)
from PM.app.utils import preprocess_frame


def detect_parking_status(video_path, posList, send_callback, headless=False):
    """
    Оптимизированная версия детектора парковочных мест.
    Работает быстрее, стабильнее и экономнее ресурсов.
    """

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"⚠️ [ОШИБКА] Не удалось открыть видео: {video_path}")
        return

    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # === 1️⃣ Предварительно создаём маски для каждого полигона ===
    masks = []
    for poly in posList:
        mask = np.zeros((frame_h, frame_w), np.uint8)
        cv2.fillPoly(mask, [np.array(poly, np.int32)], 255)
        masks.append(mask)

    print(f"✅ Загружено {len(masks)} парковочных зон. Начинаем анализ видео...")

    # === Инициализация данных ===
    frame_id = 0
    history = {i: deque(maxlen=STABILITY_FRAMES) for i in range(len(posList))}
    last_known_statuses = {}
    last_send_time = 0
    fps_times = deque(maxlen=30)

    while True:
        start_time = time.time()
        ret, frame = cap.read()

        # Перезапуск видео, если дошли до конца
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_id += 1
        if frame_id % FRAME_SKIP != 0:
            continue

        # === 2️⃣ Предобработка кадра ===
        img_pro = preprocess_frame(frame)

        current_statuses_list = []
        statuses_changed = False

        # === 3️⃣ Проверяем все парковочные места ===
        for idx, mask in enumerate(masks):
            count = cv2.countNonZero(cv2.bitwise_and(img_pro, img_pro, mask=mask))
            status = "free" if count < THRESHOLD_COUNT else "occupied"

            # Добавляем в историю для стабилизации
            history[idx].append(status)
            if len(history[idx]) < STABILITY_FRAMES:
                stable_status = "..."  # неустойчивый статус
            else:
                stable_status = max(set(history[idx]), key=history[idx].count)

            current_statuses_list.append({"id": idx + 1, "status": stable_status})

            # Проверяем, изменился ли стабильный статус
            if last_known_statuses.get(idx) != stable_status and stable_status != "...":
                statuses_changed = True
                last_known_statuses[idx] = stable_status

            # === 4️⃣ Визуализация ===
            if not headless:
                color = (0, 255, 0) if stable_status == "free" else (0, 0, 255)
                if stable_status == "...":
                    color = (0, 255, 255)  # жёлтый — нестабильно

                overlay = frame.copy()
                cv2.fillPoly(overlay, [np.array(posList[idx], np.int32)], color)
                cv2.addWeighted(overlay, 0.35, frame, 0.65, 0, frame)

                pts = np.array(posList[idx], np.int32)
                cv2.polylines(frame, [pts], True, (255, 255, 255), 2)

                cx, cy = np.mean(pts[:, 0]), np.mean(pts[:, 1])
                cv2.putText(frame, f"{idx + 1}", (int(cx) - 10, int(cy) + 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)

        # === 5️⃣ Отправка обновлений на сервер ===
        now = time.time()
        if statuses_changed and (now - last_send_time > UPDATE_COOLDOWN_SECONDS):
            print("🔁 Обновление статусов... Отправка на сервер.")
            final_statuses = [s for s in current_statuses_list if s["status"] != "..."]
            if final_statuses:
                send_callback(final_statuses)
                last_send_time = now

        # === 6️⃣ FPS измерение ===
        fps_times.append(1 / (time.time() - start_time))
        if frame_id % 50 == 0:
            print(f"⚡ Средний FPS: {np.mean(fps_times):.1f}")

        # === 7️⃣ Отображение окна ===
        if not headless:
            resized = cv2.resize(frame, None, fx=DISPLAY_SCALE, fy=DISPLAY_SCALE)
            cv2.imshow("Smart Parking (Optimized)", resized)
            if cv2.waitKey(1) & 0xFF == 27:
                print("🛑 ESC — выход.")
                break

    cap.release()
    if not headless:
        cv2.destroyAllWindows()
    print("✅ Детектор остановлен.")
