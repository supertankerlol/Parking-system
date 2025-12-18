# utils.py
import pickle
import os
import cv2
import numpy as np

POLY_FILE = 'polygons.pkl'


def save_polygons(polygons, path=POLY_FILE):
    with open(path, 'wb') as f:
        pickle.dump(polygons, f)


def load_polygons(path=POLY_FILE):
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f)
    return []


def polygon_area(pts):
    # pts: list of (x,y) 4 points in order
    pts_np = np.array(pts, dtype=np.int32)
    return abs(cv2.contourArea(pts_np))


def mask_from_polygon(img_shape, pts):
    mask = np.zeros((img_shape[0], img_shape[1]), dtype=np.uint8)
    cv2.fillPoly(mask, [np.array(pts, dtype=np.int32)], 255)
    return mask


def crop_polygon(img, pts):
    # returns bounding crop and mask-cropped image
    mask = mask_from_polygon(img.shape, pts)
    x, y, w, h = cv2.boundingRect(np.array(pts, dtype=np.int32))
    img_crop = img[y:y + h, x:x + w]
    mask_crop = mask[y:y + h, x:x + w]
    return img_crop, mask_crop, (x, y, w, h)
