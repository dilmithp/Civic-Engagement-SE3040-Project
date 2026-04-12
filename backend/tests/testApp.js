/**
 * testApp.js — Test-safe Express app factory
 * ─────────────────────────────────────────────────────────────────────────
 * This module re-creates the Express app without the swagger YAML loading
 * (which uses import.meta.url — incompatible with Jest's CommonJS transform).
 *
 * Used exclusively by integration tests. The production app entry is src/app.js.
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorMiddleware } from '../src/middleware/error.middleware.js';
import authRoutes from '../src/routes/auth.routes.js';
import issueRoutes from '../src/routes/issue.routes.js';
import marketplaceRoutes from '../src/routes/marketplace.routes.js';
import surveyRoutes from '../src/routes/survey.routes.js';
import geocodingRoutes from '../src/routes/geocoding.routes.js';
import greenInitiativeRoutes from '../src/routes/greenInitiative.routes.js';
import '../src/models/User.model.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Skip morgan logging during tests to keep output clean
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// API Routes — same as production
app.use('/api/v1/auth', authRoutes);
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
    res.status(404).json({ status: 'error', message: `Can't find ${req.originalUrl}` });
});

app.use(errorMiddleware);

export default app;
