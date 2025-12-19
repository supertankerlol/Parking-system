# API Specification

## Base URL
http://127.0.0.1:8080

## POST /update
Purpose: Update parking spot status from camera client

Request Body:
```json
{
  "spot_id": 1,
  "status": "free"
}
{
  "message": "Update received"
}
GET /status
[
  {"spot_id": 1, "status": "free"},
  {"spot_id": 2, "status": "occupied"}
]
GET /free
{
  "free_spots": 26
}
