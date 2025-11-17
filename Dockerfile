# Используем официальный Python-образ
FROM python:3.9-slim

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0

# Рабочая директория
WORKDIR /app

# Копируем проект
COPY ./app /app

# Устанавливаем Python-зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем команду запуска
CMD ["python", "main.py"]
