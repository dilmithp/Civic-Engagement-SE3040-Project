import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/error.middleware.js';
import { CORS_ORIGIN } from './config/env.js';
import issueRoutes from './routes/issue.routes.js';

// Import models to register Mongoose schemas (needed for populate)
import './models/User.model.js';

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

// API Routes
app.use('/api/v1/issues', issueRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;

