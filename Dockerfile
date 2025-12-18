# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    ffmpeg libgl1 libglib2.0-0 wget gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy code
COPY cv_service.py config.yml parking_positions.json /app/

# create snapshots dir
RUN mkdir -p /data/snapshots
VOLUME ["/data/snapshots"]

ENV SHOW_WINDOW=0

CMD ["python", "cv_service.py", "--config", "config.yml", "--positions", "parking_positions.json"]
