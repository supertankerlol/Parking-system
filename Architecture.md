# System Architecture

## 1. Architecture Style
Client–Server architecture.

## 2. System Components
- Frontend: Web dashboard for users
- Backend: FastAPI server
- Computer Vision Client: OpenCV-based detection
- Storage: JSON-based persistence

## 3. Component Interaction
The camera client detects parking occupancy and sends updates to the backend API. The frontend requests parking data from the API and displays it to users.

## 4. Data Flow
1. Camera captures parking video
2. OpenCV detects spot occupancy
3. Backend API receives updates
4. Frontend displays current status

## 5. Database Structure
- Users
- Vehicles
- Parking spots
- Reservations

## 6. Technology Decisions
- FastAPI: fast development and auto-documentation
- OpenCV: reliable computer vision processing
- JSON storage: lightweight MVP solution

## 7. Future Extensions
- Cloud deployment
- Database migration
- Mobile app integration
