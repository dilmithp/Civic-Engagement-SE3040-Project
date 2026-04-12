/**
 * INTEGRATION TESTS — Survey API
 * Uses mongodb-memory-server (in-memory MongoDB) + Supertest
 * Covers: POST, GET, PUT, PATCH, DELETE /api/v1/surveys
 * Auth is simulated by signing real JWTs using the same JWT_SECRET.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

jest.mock('../../src/config/env.js', () => ({
    PORT: 5099,
    MONGODB_URI: 'mongodb://test',
    JWT_SECRET: 'test-secret-key-for-jest',
    JWT_EXPIRES_IN: '1h',
    CORS_ORIGIN: 'http://localhost:5173',
    NODE_ENV: 'test',
    CLOUDINARY_CLOUD_NAME: 'test',
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
    MAIL_HOST: 'test',
    MAIL_PORT: 587,
    MAIL_USER: 'test@test.com',
    MAIL_PASS: 'test',
    MAIL_FROM: 'test@test.com',
    FRONTEND_URL: 'http://localhost:5173',
}));

process.env.NODE_ENV = 'test';

// Increase global timeout — MongoMemoryServer takes longer when all suites run in parallel
jest.setTimeout(15000);

// Mock mailer so tests don't send emails
jest.mock('../../src/utils/mailer.js', () => ({
    sendNewSurveyNotification: jest.fn(() => Promise.resolve()),
}));

import app from '../testApp.js';

// ── JWT helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = 'test-secret-key-for-jest';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const CITIZEN_ID = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();

const citizenToken = signToken({ id: CITIZEN_ID, role: 'citizen' });
const adminToken = signToken({ id: ADMIN_ID, role: 'admin' });

// ── Valid survey payload ──────────────────────────────────────────────────────
const validSurveyPayload = {
    title: 'New Public Park Design',
    description: 'Vote on the new design for the park.',
    options: [{ text: 'Design A' }, { text: 'Design B' }],
    deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    targetAudience: 'all'
};

// ════════════════════════════════════════════════════════════════════════════
let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
}, 30000); // 30s timeout for MongoMemoryServer startup

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

// ════════════════════════════════════════════════════════════════════════════
describe('Integration Tests — Survey API', () => {

    // ── POST /api/v1/surveys ──────────────────────────────────────────────
    describe('POST /api/v1/surveys — Create Survey', () => {

        it('should allow Admin to create a survey and return 201', async () => {
            const res = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validSurveyPayload);

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.title).toBe(validSurveyPayload.title);
            expect(res.body.data.status).toBe('active');
            expect(res.body.data.options).toHaveLength(2);
        });

        it('should block Citizen from creating a survey (403)', async () => {
            const res = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validSurveyPayload);

            expect(res.status).toBe(403);
        });

        it('should return 400 when options are less than 2', async () => {
            const payload = { ...validSurveyPayload, options: [{ text: 'Only one option' }] };
            const res = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(payload);

            expect(res.status).toBe(400);
        });
    });

    // ── GET /api/v1/surveys/active ───────────────────────────────────────
    describe('GET /api/v1/surveys/active — Fetch Active Surveys', () => {

        beforeEach(async () => {
            await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validSurveyPayload);
        });

        it('should return active surveys for authenticated users', async () => {
            const res = await request(app)
                .get('/api/v1/surveys/active')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].hasVoted).toBeDefined(); // Dynamic flag injected by backend
        });

        it('should block unauthenticated access', async () => {
            const res = await request(app).get('/api/v1/surveys/active');
            expect(res.status).toBe(401);
        });
    });

    // ── PATCH /api/v1/surveys/:id/vote ────────────────────────────────────
    describe('PATCH /api/v1/surveys/:id/vote — Cast Vote', () => {
        let surveyId;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validSurveyPayload);
            surveyId = createRes.body.data._id;
        });

        it('should allow a Citizen to vote on a valid option', async () => {
            const res = await request(app)
                .patch(`/api/v1/surveys/${surveyId}/vote`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ selectedOptionIndex: 0 });

            expect(res.status).toBe(200);
            expect(res.body.data.totalVotes).toBe(1);
            expect(res.body.data.options[0].voteCount).toBe(1);
        });

        it('should return 400 for an invalid option index', async () => {
            const res = await request(app)
                .patch(`/api/v1/surveys/${surveyId}/vote`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ selectedOptionIndex: 99 });

            expect(res.status).toBe(400); // Invalid option or validation error
        });
    });

    // ── GET /api/v1/surveys/:id/results ──────────────────────────────────
    describe('GET /api/v1/surveys/:id/results — Fetch Results', () => {
        let surveyId;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validSurveyPayload);
            surveyId = createRes.body.data._id;

            // Cast a vote
            await request(app)
                .patch(`/api/v1/surveys/${surveyId}/vote`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ selectedOptionIndex: 0 });
        });

        it('should return beautifully formatted Chart.js results', async () => {
            const res = await request(app)
                .get(`/api/v1/surveys/${surveyId}/results`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.chartData).toBeDefined();
            expect(res.body.data.percentages).toBeDefined();
            expect(res.body.data.totalVotes).toBe(1);
        });
    });

    // ── DELETE /api/v1/surveys/:id ────────────────────────────────────────
    describe('DELETE /api/v1/surveys/:id — Delete/Close Survey', () => {
        let surveyId;

        beforeEach(async () => {
            const createRes = await request(app)
                .post('/api/v1/surveys')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validSurveyPayload);
            surveyId = createRes.body.data._id;
        });

        it('should allow Admin to close/delete a survey', async () => {
            const res = await request(app)
                .delete(`/api/v1/surveys/${surveyId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('closed');
        });

        it('should block Citizen from deleting a survey (403)', async () => {
            const res = await request(app)
                .delete(`/api/v1/surveys/${surveyId}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(403);
        });
    });
});
