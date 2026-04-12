/**
 * INTEGRATION TESTS — Marketplace API
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
}));

process.env.NODE_ENV = 'test';
jest.setTimeout(15000);

import app from '../testApp.js';

const JWT_SECRET = 'test-secret-key-for-jest';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
}

// MUST use valid ObjectId strings because the model uses ObjectId for owner
const OWNER_ID = new mongoose.Types.ObjectId().toString();
const OTHER_USER_ID = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();

const ownerToken = signToken({ id: OWNER_ID, role: 'user' });
const otherUserToken = signToken({ id: OTHER_USER_ID, role: 'user' });
const adminToken = signToken({ id: ADMIN_ID, role: 'admin' });

const validListingPayload = {
    title: 'Vintage Bicycle',
    description: 'A well-maintained 1980s road bike.',
    category: 'Sports',
    type: 'sale',
    price: 150,
    contactInfo: 'Call 555-1234'
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

describe('Integration Tests — Marketplace API', () => {

    describe('POST /api/v1/marketplace', () => {
        it('should allow an authenticated user to create a listing', async () => {
            const res = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);

            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe(validListingPayload.title);
            expect(res.body.data.owner).toBe(OWNER_ID);
        });

        it('should return 400 for a listing without required price for sale', async () => {
            const payload = { ...validListingPayload, price: undefined };
            const res = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(payload);

            expect(res.status).toBe(400);
        });

        it('should allow creating a donation listing without a price', async () => {
            const payload = { ...validListingPayload, type: 'donation', price: undefined };
            const res = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(payload);

            expect(res.status).toBe(201);
            expect(res.body.data.type).toBe('donation');
        });
    });

    describe('GET /api/v1/marketplace', () => {
        it('should retrieve all available listings', async () => {
            await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);

            const res = await request(app).get('/api/v1/marketplace');

            expect(res.status).toBe(200);
            expect(res.body.data.listings.length).toBe(1);
        });

        it('should filter listings by category', async () => {
             await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);
            
             await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ ...validListingPayload, category: 'Furniture' });

            const res = await request(app).get('/api/v1/marketplace?category=Sports');

            expect(res.body.data.listings.length).toBe(1);
            expect(res.body.data.listings[0].category).toBe('Sports');
        });
    });

    describe('PATCH /api/v1/marketplace/:id/status', () => {
        it('should allow the owner to update listing status', async () => {
            const createRes = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);
            
            const listingId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/marketplace/${listingId}/status`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ status: 'sold' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('sold');
        });

        it('should prevent other users from updating status', async () => {
            const createRes = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);
            
            const listingId = createRes.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/marketplace/${listingId}/status`)
                .set('Authorization', `Bearer ${otherUserToken}`)
                .send({ status: 'sold' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/v1/marketplace/:id', () => {
        it('should allow the owner to delete the listing', async () => {
            const createRes = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);
            
            const listingId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/marketplace/${listingId}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
            
            const getRes = await request(app).get(`/api/v1/marketplace/${listingId}`);
            expect(getRes.status).toBe(404);
        });

        it('should allow Admin to delete any listing', async () => {
            const createRes = await request(app)
                .post('/api/v1/marketplace')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send(validListingPayload);
            
            const listingId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/marketplace/${listingId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });
    });
});
