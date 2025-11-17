import cv2
import numpy as np
import pickle

# === Настройки ===
image_path = 'carParkImg.png'
filename = 'polygons.pkl'
scale = 0.7   # уменьши до 0.5 или 0.6 если картинка большая

# === Загрузка данных ===
try:
    with open(filename, 'rb') as f:
        polygons = pickle.load(f)
except:
    polygons = []

current_points = []

# === Мышиные события ===
def mouse_click(event, x, y, flags, param):
    global current_points

    # Переводим координаты обратно в оригинальный размер
    x = int(x / scale)
    y = int(y / scale)

    if event == cv2.EVENT_LBUTTONDOWN:
        current_points.append((x, y))
        if len(current_points) == 4:
            polygons.append(current_points.copy())
            current_points = []
            with open(filename, 'wb') as f:
                pickle.dump(polygons, f)
            print(f"🟩 Added polygon, total: {len(polygons)}")

    elif event == cv2.EVENT_RBUTTONDOWN:
        for poly in polygons:
            pts = np.array(poly, np.int32)
            if cv2.pointPolygonTest(pts, (x, y), False) >= 0:
                polygons.remove(poly)
                with open(filename, 'wb') as f:
                    pickle.dump(polygons, f)
                print(f"❌ Removed polygon, total: {len(polygons)}")
                break


# === Основной цикл ===
while True:
    img = cv2.imread(image_path)
    if img is None:
        print("⚠️ Не найден файл carParkImg.png — проверь путь.")
        break

    # Уменьшаем изображение
    img_resized = cv2.resize(img, (0, 0), fx=scale, fy=scale)

    # Отрисовка всех сохранённых полигонов
    for poly in polygons:
        pts = np.array([(int(x * scale), int(y * scale)) for (x, y) in poly], np.int32)
        cv2.polylines(img_resized, [pts], True, (255, 0, 255), 2)

    # Отрисовка текущих точек
    for point in current_points:
        px, py = int(point[0] * scale), int(point[1] * scale)
        cv2.circle(img_resized, (px, py), 5, (0, 255, 0), -1)

    # Добавим текст-подсказку
    cv2.putText(img_resized, "LMB: Add point | RMB: Delete polygon | ESC: Exit",
                (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 255, 200), 2)

    cv2.imshow("Polygon Editor (Scaled)", img_resized)
    cv2.setMouseCallback("Polygon Editor (Scaled)", mouse_click)

    key = cv2.waitKey(1)
    if key == 27:  # ESC для выхода
        break

cv2.destroyAllWindows()
print("✅ Работа завершена, файл polygons.pkl сохранён.")
