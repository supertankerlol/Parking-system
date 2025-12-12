import cv2
import pickle
import numpy as np

width, height = 107, 48

try:
    with open('CarParkPos', 'rb') as f:
        posList = pickle.load(f)
except:
    posList = []


def mouseClick(events, x, y, flags, params):
    global posList

    # Добавить новую точку
    if events == cv2.EVENT_LBUTTONDOWN:
        posList.append((x, y))

    # Удалить точку
    if events == cv2.EVENT_RBUTTONDOWN:
        for i, pos in enumerate(posList):
            x1, y1 = pos
            if x1 < x < x1 + width and y1 < y < y1 + height:
                posList.pop(i)
                break

    # Сохранить в файл
    with open('CarParkPos', 'wb') as f:
        pickle.dump(posList, f)


def cluster_columns(points, distance_threshold=60):
    points_sorted = sorted(points, key=lambda p: p[0])
    columns = []

    for p in points_sorted:
        added = False
        for col in columns:
            col_x = np.mean([c[0] for c in col])
            if abs(p[0] - col_x) < distance_threshold:
                col.append(p)
                added = True
                break
        if not added:
            columns.append([p])

    return columns


while True:
    img = cv2.imread('carParkImg.png')

    if posList:
        # группировка по колонкам
        columns = cluster_columns(posList)
        columns = sorted(columns, key=lambda col: np.mean([p[0] for p in col]))

        # сортировка сверху вниз в каждой колонке
        for i in range(len(columns)):
            columns[i] = sorted(columns[i], key=lambda p: p[1])

        # выравнивание в один список
        sortedList = []
        for col in columns:
            sortedList.extend(col)
    else:
        sortedList = posList

    # Создаем финальную структуру для сохранения в main.py
    parkingData = []

    for index, pos in enumerate(sortedList):
        x, y = pos
        cv2.rectangle(img, pos, (x + width, y + height), (255, 0, 255), 2)
        cv2.putText(img, str(index + 1), (x + 5, y + 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

        parkingData.append({
            "id": index + 1,
            "pos": (x, y),
            "w": width,
            "h": height
        })

    # 💾 сохраняем структуру в отдельный файл
    with open("ParkingData.pkl", "wb") as f:
        pickle.dump(parkingData, f)

    cv2.imshow('Parking Spots Setup', img)
    cv2.setMouseCallback('Parking Spots Setup', mouseClick)

    key = cv2.waitKey(1)

    if key == 27:
        print("Exiting setup...")
        break

cv2.destroyAllWindows()
