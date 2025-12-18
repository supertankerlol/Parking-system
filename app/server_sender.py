import requests
import json
from datetime import datetime
from PM.app.config import SERVER_URL


def send_to_server(results):
    """
    Отправляет список статусов парковочных мест на сервер.
    results: list of dicts, e.g. [{"id": 1, "status": "free"}, ...]
    """
    payload = {
        "timestamp": datetime.now().isoformat(),
        "spaces": results
    }
    try:
        response = requests.post(SERVER_URL, json=payload, timeout=5)
        response.raise_for_status()  # Вызовет ошибку для 4xx/5xx ответов
        print(f"✅ [SERVER] Успешно отправлено. Ответ: {response.status_code}")

    except requests.exceptions.Timeout:
        print(f"❌ [ERROR] Сервер не ответил (timeout).")
    except requests.exceptions.ConnectionError:
        print(f"❌ [ERROR] Ошибка подключения к серверу {SERVER_URL}.")
    except requests.exceptions.RequestException as e:
        # Эта ошибка поймает все остальные ошибки (включая 4xx/5xx)
        print(f"❌ [ERROR] Ошибка при отправке данных: {e}")
    except Exception as e:
        print(f"❌ [ERROR] Неизвестная ошибка: {e}")