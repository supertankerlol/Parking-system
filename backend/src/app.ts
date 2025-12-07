import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import bookingRoutes from './routes/booking.routes';
import parkingRoutes from './routes/parking.routes';
import userRoutes from './routes/user.routes';
import cvRoutes from './routes/cv.routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middleware
// CORS configuration - allow frontend origins with credentials
const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000'] // Add your production frontend URL here
    : true, // Allow all origins in development
  credentials: true, // Allow cookies and auth headers
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cv', cvRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
