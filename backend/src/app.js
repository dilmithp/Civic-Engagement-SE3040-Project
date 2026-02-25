import greenInitiativeRoutes from './routes/greenInitiative.routes.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middleware/error.middleware.js';
import { CORS_ORIGIN } from './config/env.js';
import issueRoutes from './routes/issue.routes.js';

import './models/User.model.js'; //  Mongoose can populate organizers

const app = express();

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Your Routes
app.use('/api/v1/green-initiatives', greenInitiativeRoutes);
app.use('/api/v1/issues', issueRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy' });
});

app.all('*', (req, res) => {
    res.status(404).json({ status: 'error', message: `Can't find ${req.originalUrl} on this server!` });
});

app.use(errorMiddleware);

export default app;