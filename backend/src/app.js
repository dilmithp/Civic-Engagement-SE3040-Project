import greenInitiativeRoutes from './routes/greenInitiative.routes.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/error.middleware.js';
import { CORS_ORIGIN } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import issueRoutes from './routes/issue.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import geocodingRoutes from './routes/geocoding.routes.js';

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/v1/green-initiatives', greenInitiativeRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/geocode', geocodingRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({ status: 'error', message: `Can't find ${req.originalUrl} on this server!` });
});

app.use(errorMiddleware);

export default app;