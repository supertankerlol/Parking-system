import cv2
import numpy as np
import imutils
import easyocr
import matplotlib.pyplot as plt


def detect_license_plate(image_path):
    # 1. Загрузка изображения
    img = cv2.imread(image_path)
    if img is None:
        print("Ошибка: Изображение не найдено.")
        return

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Уменьшение шума и поиск краев
    # bilateralFilter сохраняет края, но размывает шум
    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(bfilter, 30, 200)  # Детекция краев

    # 3. Поиск контуров
    keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    # Сортируем контуры от больших к меньшим и берем топ-10
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

    location = None
    for contour in contours:
        # Аппроксимируем контур (сглаживаем углы)
        approx = cv2.approxPolyDP(contour, 10, True)
        # Если у фигуры 4 угла, скорее всего это номер
        if len(approx) == 4:
            location = approx
            break

    if location is None:
        print("Не удалось найти контур номера.")
        return

    # 4. Создание маски для изоляции номера
    mask = np.zeros(gray.shape, np.uint8)
    new_image = cv2.drawContours(mask, [location], 0, 255, -1)
    new_image = cv2.bitwise_and(img, img, mask=mask)

    # Обрезаем изображение (crop) именно по координатам номера
    (x, y) = np.where(mask == 255)
    (x1, y1) = (np.min(x), np.min(y))
    (x2, y2) = (np.max(x), np.max(y))
    cropped_image = gray[x1:x2 + 1, y1:y2 + 1]

    # 5. Распознавание текста (OCR)
    # 'en' - английский, можно добавить 'ru' если номера РФ/СНГ (но цифры читаются и так)
    reader = easyocr.Reader(['en'])
    result = reader.readtext(cropped_image)

    if result:
        text = result[0][-2]  # Сам текст номера
        accuracy = result[0][-1]  # Точность распознавания
        print(f"Распознанный номер: {text} (Точность: {accuracy:.2f})")

        # 6. Визуализация и Сохранение
        font = cv2.FONT_HERSHEY_SIMPLEX
        res = cv2.putText(img, text=text, org=(approx[0][0][0], approx[1][0][1] + 60),
                          fontFace=font, fontScale=1, color=(0, 255, 0), thickness=2, lineType=cv2.LINE_AA)
        res = cv2.rectangle(img, tuple(approx[0][0]), tuple(approx[2][0]), (0, 255, 0), 3)

        # Вывод на экран
        cv2.imshow("Результат", res)
        cv2.imshow("Обрезанный номер", cropped_image)

        # Сохранение результата
        output_filename = 'result_plate.jpg'
        cv2.imwrite(output_filename, res)
        print(f"Изображение сохранено как {output_filename}")

        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("Текст на номере не распознан.")


# Запуск функции (укажите путь к вашему фото)
detect_license_plate('11f80fda2c38011c.jpg')