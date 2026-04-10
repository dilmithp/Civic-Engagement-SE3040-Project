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
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';


import './models/User.model.js'; //  Mongoose can populate organizers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

const app = express();

const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
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

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({ status: 'error', message: `Can't find ${req.originalUrl} on this server!` });
});

app.use(errorMiddleware);

export default app;
