# 🚗 Parking Management System

A modern, full-stack parking management system that allows users to find, book, and pay for parking spots directly from an interactive map. The system features real-time spot availability, indoor garage maps, booking management, payment processing, and a comprehensive user dashboard.

![Parking System](images_website/initial_page.png)

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Docker Deployment](#-docker-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

## 🚀 Quick Start

### Prerequisites Check
- ✅ Node.js (v18+) installed
- ✅ PostgreSQL (v14+) installed and running
- ✅ npm or yarn installed

### 5-Minute Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd Parking-system/backend
   npm install
   ```

2. **Setup database:**
   ```bash
   # Create .env file from example
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run migrations
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed  # Optional: seed with sample data
   ```

3. **Start backend:**
   ```bash
   npm run dev
   # Backend runs on http://localhost:5000
   ```

4. **Start frontend (new terminal):**
   ```bash
   cd ../frontend_user
   npx serve . -l 3000
   # Frontend runs on http://localhost:3000
   ```

5. **Open browser:**
   Navigate to `http://localhost:3000` and start using the parking system!

**Default Ports:**
- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## ✨ Features

### 🗺️ Interactive Map-Based Booking
- **Interactive Map**: Browse available parking garages on an interactive map
- **Indoor Maps**: View detailed floor plans of parking garages
- **Real-time Availability**: See which spots are available in real-time using WebSocket connections
- **Spot Selection**: Click on available spots to view details and book

### 📅 Booking System
- **Time Selection**: Choose start and end times for your parking session
- **Automatic Pricing**: System calculates total hours and cost based on hourly rates
- **Booking Management**: View and manage all your bookings from the dashboard

### 💳 Payment Processing
- **Secure Payments**: Complete payment transactions securely
- **Payment History**: Download and view your complete payment history
- **Multiple Payment Methods**: Support for various payment methods

### 👤 User Management
- **Authentication**: Secure login and registration system
- **Profile Management**: 
  - Update avatar/profile picture
  - Change password
  - Add and manage vehicles
  - Download payment history
- **User Dashboard**: 
  - View parking status and location
  - Check payment history
  - Monitor active bookings

### 🎨 User Interface
- **Theme Support**: 
  - 🌙 Dark mode
  - ☀️ Light mode
  - 🖥️ System mode (follows OS preference)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

### 🏢 Admin Features
- **Garage Management**: Create and manage parking garages
- **Spot Management**: Configure parking spots, pricing, and availability
- **User Management**: Admin dashboard for user oversight
- **Analytics**: Track parking usage and revenue

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO for WebSocket connections
- **File Upload**: Multer for handling file uploads
- **Security**: Helmet, CORS, bcrypt for password hashing

### Frontend
- **Technology**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with modern design patterns
- **Maps**: Custom map implementation
- **Real-time Updates**: Socket.IO client

### Development Tools
- **TypeScript**: Type-safe development
- **Prisma**: Database ORM and migrations
- **Jest**: Testing framework
- **Docker**: Containerization support

## 📁 Project Structure

```
Parking-system/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Express middlewares
│   │   ├── sockets/        # WebSocket handlers
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Database schema and migrations
│   ├── tests/              # Test files
│   ├── uploads/            # Uploaded files (avatars, etc.)
│   ├── Dockerfile          # Docker configuration
│   └── package.json
│
├── frontend_user/           # Frontend application
│   ├── pages/              # HTML pages
│   ├── js/                 # JavaScript modules
│   ├── css/                # Stylesheets
│   ├── components/         # Reusable components
│   ├── assets/             # Images, icons, fonts
│   └── index.html          # Landing page
│
├── images_website/          # Screenshots and documentation images
└── README.md               # This file
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

Optional:
- **Docker** and **Docker Compose** (for containerized deployment)
- **npx serve** (for serving frontend in development)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Parking-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies (if any)

```bash
cd ../frontend_user
# Frontend uses vanilla JS, no npm install needed
# But you'll need npx serve for development
```

### 4. Database Setup

1. **Create a PostgreSQL database**:
   ```sql
   CREATE DATABASE parking_system;
   ```

2. **Configure environment variables** (see [Configuration](#-configuration))

3. **Run Prisma migrations**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed the database** (optional):
   ```bash
   npm run prisma:seed
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory. A `.env.example` file is provided as a template:

```bash
cd backend
cp .env.example .env
# Or on Windows PowerShell:
# Copy-Item .env.example .env
```

**Note:** The `.env.example` file contains all required and optional environment variables with descriptions. Make sure to:
- Change `JWT_SECRET` to a strong random string (minimum 32 characters)
- Update `DATABASE_URL` with your PostgreSQL credentials
- Set `CV_SECRET` if using computer vision features

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/parking_system?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CV/Computer Vision (optional)
CV_SECRET="your-cv-secret-key"

# Redis (optional, for caching)
REDIS_URL="redis://localhost:6379"

# MinIO (optional, for file storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false
MINIO_BUCKET="parking-system"
```

### Frontend Configuration

The frontend automatically detects the API URL based on the hostname. For local development, it defaults to `http://localhost:5000/api`.

To override, you can modify `frontend_user/js/config.js` or set these before the config script loads:
```javascript
window.API_BASE_OVERRIDE = 'http://your-api-url/api';
window.SOCKET_URL_OVERRIDE = 'ws://your-socket-url';
```

## 🏃 Running the Application

### Development Mode

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on **http://localhost:5000**

#### Start the Frontend Server

In a new terminal:

```bash
cd frontend_user
npx serve . -l 3000
```

The frontend will be available at **http://localhost:3000**

### Production Mode

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

Use any static file server (nginx, Apache, etc.) or deploy to a hosting service like Vercel, Netlify, etc.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Parking
- `GET /api/parking/garages` - Get all parking garages
- `GET /api/parking/garages/:id` - Get garage details
- `GET /api/parking/garages/:id/floors` - Get garage floors
- `GET /api/parking/spots` - Get available spots
- `GET /api/parking/spots/:id` - Get spot details

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history
- `GET /api/payments/:id` - Get payment details

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/avatar` - Upload avatar
- `GET /api/users/payment-history` - Download payment history

### Admin
- Various admin endpoints for managing garages, spots, users, etc.

## 📸 Screenshots

### Initial Landing Page
The welcome page that introduces users to the parking system.

![Initial Page](images_website/initial_page.png)

### Registration
Create a new account to start using the parking system.

![Registration](images_website/register.png)

### Login
Sign in to your account.

![Login](images_website/login.png)

### Interactive Map
Browse available parking garages on the interactive map. Click on garages to view details.

![Map](images_website/map.png)

### Indoor Garage Map
After selecting a garage, view the detailed floor plan with available spots.

![Indoor Map](images_website/indoor_map.png)

### Booking Window
Select your parking time slot. The system automatically calculates the total hours and cost.

![Booking](images_website/booking.png)

### Payment Page
Complete your payment securely.

![Payment](images_website/payment.png)

### User Dashboard
View your parking status, active bookings, and payment history.

![Dashboard](images_website/dashboard.png)

### User Profile
Manage your profile, change avatar, update password, add vehicles, and download payment history.

![User Profile](images_website/user_profile.png)

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

Docker Compose will automatically set up PostgreSQL, Redis, and the backend API.

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create `.env` file** (optional, defaults are provided):
   ```bash
   cp .env.example .env
   # Edit .env if you want to customize settings
   ```

3. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run prisma:generate
   docker-compose exec backend npm run prisma:migrate
   ```

5. **Seed database** (optional):
   ```bash
   docker-compose exec backend npm run prisma:seed
   ```

6. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

7. **Stop services:**
   ```bash
   docker-compose down
   ```

**Services included:**
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 5000)

### Using Dockerfile Only

If you already have a database running:

1. **Build the image:**
   ```bash
   cd backend
   docker build -t parking-system-backend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
     -e JWT_SECRET="your-secret" \
     -e CV_SECRET="your-cv-secret" \
     -v $(pwd)/uploads:/app/uploads \
     parking-system-backend
   ```

## 🧪 Testing

### Run Tests

```bash
cd backend
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Test Coverage

```bash
npm run test:coverage
```

### Setup Test Database

```bash
npm run test:setup-db
```

## 🔧 Troubleshooting

### Port Already in Use

If port 5000 is already in use:

**Windows:**
```bash
cd backend
npm run free-port
```

Or manually:
```bash
netstat -ano | findstr :5000
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` is correct
3. Check database credentials
4. Ensure database exists: `CREATE DATABASE parking_system;`

### Frontend Not Connecting to Backend

1. Verify backend is running on port 5000
2. Check CORS configuration in `backend/src/app.ts`
3. Verify API URL in `frontend_user/js/config.js`
4. Check browser console for errors

## 📝 Development Notes

### Database Migrations

After modifying the Prisma schema:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### Adding New Features

1. Update Prisma schema if database changes are needed
2. Create/update service layer in `backend/src/services/`
3. Create/update controller in `backend/src/controllers/`
4. Add routes in `backend/src/routes/`
5. Update frontend JavaScript modules as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name/Team

## 🙏 Acknowledgments

- Thanks to all contributors
- Map implementation and design inspiration
- Open source libraries and tools used

---

**Happy Parking! 🚗💨**
