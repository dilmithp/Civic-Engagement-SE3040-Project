/**
 * INTEGRATION TESTS — Green Initiatives API
 * Uses mongodb-memory-server (in-memory MongoDB) + Supertest
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
    WEATHER_API_KEY: 'test-key'
}));

process.env.NODE_ENV = 'test';
jest.setTimeout(15000);

// Mock weather service to avoid API calls
jest.mock('../../src/utils/weather.service.js', () => ({
    fetchWeatherForEvent: jest.fn(() => Promise.resolve({
        temp: 25,
        condition: 'Clear',
        description: 'clear sky'
    })),
}));

import app from '../testApp.js';

const JWT_SECRET = 'test-secret-key-for-jest';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
}

// Using numeric-compatible IDs because model uses Number for organizer
const USER_ID = "12345";
const ADMIN_ID = "99999";

const userToken = signToken({ id: USER_ID, role: 'user' });
const adminToken = signToken({ id: ADMIN_ID, role: 'admin' });

const validInitiativePayload = {
    title: 'Community Tree Planting',
    description: 'Help us plant 100 trees in the city park.',
    location: 'Central Park',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'Upcoming'
};

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
}, 30000);

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

describe('Integration Tests — Green Initiatives API', () => {

    describe('POST /api/v1/green-initiatives', () => {
        it('should allow an authenticated user to create an initiative', async () => {
            const res = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);

            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe(validInitiativePayload.title);
            expect(res.body.data.organizer).toBe(Number(USER_ID));
            expect(res.body.data.isOfficial).toBe(false);
            expect(res.body.data.weatherForecast).toBeDefined();
        });

        it('should mark as official when created by an admin', async () => {
            const res = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validInitiativePayload);

            expect(res.status).toBe(201);
            expect(res.body.data.isOfficial).toBe(true);
        });

        it('should return 401 if not token is provided', async () => {
            const res = await request(app)
                .post('/api/v1/green-initiatives')
                .send(validInitiativePayload);

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/v1/green-initiatives', () => {
        it('should retrieve all initiatives', async () => {
            // Create two initiatives
            await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);
            
            await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...validInitiativePayload, title: 'Beach Cleanup' });

            const res = await request(app).get('/api/v1/green-initiatives');

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(2);
        });
    });

    describe('PUT /api/v1/green-initiatives/:id', () => {
        it('should allow the owner to update the initiative', async () => {
            const createRes = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);
            
            const initiativeId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/v1/green-initiatives/${initiativeId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: 'Updated Title' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Title');
        });

        it('should prevent non-owners from updating (403)', async () => {
            const createRes = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);
            
            const initiativeId = createRes.body.data._id;
            const otherUserToken = signToken({ id: "55555", role: 'user' });

            const res = await request(app)
                .put(`/api/v1/green-initiatives/${initiativeId}`)
                .set('Authorization', `Bearer ${otherUserToken}`)
                .send({ title: 'Hacker Title' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/v1/green-initiatives/:id', () => {
        it('should allow the owner to delete the initiative', async () => {
            const createRes = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);
            
            const initiativeId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/green-initiatives/${initiativeId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            
            const getRes = await request(app).get(`/api/v1/green-initiatives/${initiativeId}`);
            expect(getRes.status).toBe(404);
        });

        it('should allow Admin to delete any initiative', async () => {
            const createRes = await request(app)
                .post('/api/v1/green-initiatives')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validInitiativePayload);
            
            const initiativeId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/green-initiatives/${initiativeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });
    });
});
