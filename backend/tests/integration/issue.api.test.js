/**
 * INTEGRATION TESTS — Issue Reporting API
 * Uses mongodb-memory-server (in-memory MongoDB) + Supertest
 * to test the full HTTP request → controller → service → DB cycle.
 *
 * Covers: POST, GET, PUT, PATCH, DELETE /api/v1/issues
 * Auth is simulated by signing real JWTs using the same JWT_SECRET.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock env.js FIRST — jest.mock() is hoisted before all imports ─────────────
// This ensures the test JWT_SECRET is used instead of the real .env value.
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

// Mock Cloudinary so no real uploads happen
jest.mock('../../src/services/cloudinary.service.js', () => ({
    __esModule: true,
    default: {
        extractUploadedImages: jest.fn(() => []),
        deleteImages: jest.fn(() => Promise.resolve()),
    },
}));

// Mock geocoding so no real HTTP calls happen
jest.mock('../../src/services/geocoding.service.js', () => ({
    __esModule: true,
    default: {
        reverseGeocode: jest.fn(() =>
            Promise.resolve({ displayName: 'Colombo, Western Province, Sri Lanka' })
        ),
    },
}));

// Mock the entire Cloudinary config (upload middleware + SDK) so no real Cloudinary calls happen
jest.mock('../../src/config/cloudinary.config.js', () => {
    return {
        __esModule: true,
        upload: {
            array: jest.fn(() => (req, res, next) => next()),
        },
        cloudinary: {
            config: jest.fn(),
            uploader: { destroy: jest.fn(() => Promise.resolve()) },
        },
    };
});

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: { destroy: jest.fn(() => Promise.resolve()) },
    },
}));

// ── Import the test-safe app (omits swagger YAML loading — no import.meta.url) ──────
import app from '../testApp.js';

// ── JWT helpers ──────────────────────────────────────────────────────────────
const JWT_SECRET = 'test-secret-key-for-jest';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const CITIZEN_ID = new mongoose.Types.ObjectId().toString();
const ADMIN_ID = new mongoose.Types.ObjectId().toString();
const OTHER_USER_ID = new mongoose.Types.ObjectId().toString();

const citizenToken = signToken({ id: CITIZEN_ID, role: 'citizen' });
const adminToken = signToken({ id: ADMIN_ID, role: 'admin' });
const officialToken = signToken({ id: OTHER_USER_ID, role: 'official' });

// ── Valid issue payload ───────────────────────────────────────────────────────
const validIssuePayload = {
    title: 'Broken Streetlight on Galle Road',
    description: 'The streetlight near Galle Face has been broken for two weeks.',
    category: 'Broken Streetlight',
    latitude: '6.9271',
    longitude: '80.2707',
    address: 'Galle Face, Colombo 03',
};

// ════════════════════════════════════════════════════════════════════════════
let mongod;
let createdIssueId;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    // Clear issue collection between tests for isolation
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
describe('Integration Tests — Issue Reporting API', () => {

    // ── POST /api/v1/issues ──────────────────────────────────────────────
    describe('POST /api/v1/issues — Create Issue', () => {

        it('TC-I-01 | should create an issue and return 201 for authenticated citizen', async () => {
            const res = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.title).toBe(validIssuePayload.title);
            expect(res.body.data.reporter).toBe(CITIZEN_ID);
            expect(res.body.data.status).toBe('Pending');

            createdIssueId = res.body.data._id;
        });

        it('TC-I-02 | should return 401 when no auth token is provided', async () => {
            const res = await request(app)
                .post('/api/v1/issues')
                .send(validIssuePayload);

            expect(res.status).toBe(401);
        });

        it('TC-I-03 | should return 400 when title is missing', async () => {
            const { title, ...withoutTitle } = validIssuePayload;

            const res = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(withoutTitle);

            expect(res.status).toBe(400);
        });

        it('TC-I-04 | should return 400 for an invalid category', async () => {
            const res = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ ...validIssuePayload, category: 'InvalidCategory' });

            expect(res.status).toBe(400);
        });

        it('TC-I-05 | should return 400 when description is missing', async () => {
            const { description, ...withoutDesc } = validIssuePayload;

            const res = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(withoutDesc);

            expect(res.status).toBe(400);
        });
    });

    // ── GET /api/v1/issues ───────────────────────────────────────────────
    describe('GET /api/v1/issues — Public Feed', () => {

        beforeEach(async () => {
            // Seed one issue
            await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);
        });

        it('TC-I-06 | should return 200 and a paginated list of issues (public, no auth)', async () => {
            const res = await request(app).get('/api/v1/issues');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data.docs)).toBe(true);
            expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1);
        });

        it('TC-I-07 | should filter issues by category', async () => {
            const res = await request(app)
                .get('/api/v1/issues')
                .query({ category: 'Broken Streetlight' });

            expect(res.status).toBe(200);
            expect(res.body.data.docs.every(i => i.category === 'Broken Streetlight')).toBe(true);
        });

        it('TC-I-08 | should return empty list for a category with no issues', async () => {
            const res = await request(app)
                .get('/api/v1/issues')
                .query({ category: 'Graffiti' });

            expect(res.status).toBe(200);
            expect(res.body.data.docs).toHaveLength(0);
        });

        it('TC-I-09 | should apply search query across title and description', async () => {
            const res = await request(app)
                .get('/api/v1/issues')
                .query({ search: 'Galle Road' });

            expect(res.status).toBe(200);
            expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1);
        });

        it('TC-I-10 | should respect page and limit pagination params', async () => {
            const res = await request(app)
                .get('/api/v1/issues')
                .query({ page: 1, limit: 1 });

            expect(res.status).toBe(200);
            expect(res.body.data.docs.length).toBeLessThanOrEqual(1);
        });
    });

    // ── GET /api/v1/issues/:id ───────────────────────────────────────────
    describe('GET /api/v1/issues/:id — Get Single Issue', () => {

        it('TC-I-11 | should return 200 and the issue for a valid ID', async () => {
            // First create
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app).get(`/api/v1/issues/${id}`);
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(id);
        });

        it('TC-I-12 | should return 404 for a non-existent issue ID', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/v1/issues/${fakeId}`);
            expect(res.status).toBe(404);
        });

        it('TC-I-13 | should return 400 for a malformed (non-ObjectId) issue ID', async () => {
            const res = await request(app).get('/api/v1/issues/not-a-valid-id');
            expect(res.status).toBe(400);
        });
    });

    // ── GET /api/v1/issues/my-issues ─────────────────────────────────────
    describe('GET /api/v1/issues/my-issues — User\'s Own Issues', () => {

        it('TC-I-14 | should return only the authenticated user\'s issues', async () => {
            // Create one issue as citizen
            await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const res = await request(app)
                .get('/api/v1/issues/my-issues')
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.docs.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data.docs.every(i => i.reporter === CITIZEN_ID)).toBe(true);
        });

        it('TC-I-15 | should return 401 when no auth token provided', async () => {
            const res = await request(app).get('/api/v1/issues/my-issues');
            expect(res.status).toBe(401);
        });
    });

    // ── PUT /api/v1/issues/:id — Update Issue ────────────────────────────
    describe('PUT /api/v1/issues/:id — Update Issue', () => {

        it('TC-I-16 | should allow the reporter to update a Pending issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .put(`/api/v1/issues/${id}`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ title: 'Updated Streetlight Title' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Streetlight Title');
        });

        it('TC-I-17 | should return 403 when another user tries to update someone else\'s issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;
            const otherToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: 'citizen' });

            const res = await request(app)
                .put(`/api/v1/issues/${id}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ title: 'Hijacked Title' });

            expect(res.status).toBe(403);
        });

        it('TC-I-18 | should return 401 when unauthenticated', async () => {
            const res = await request(app)
                .put(`/api/v1/issues/${new mongoose.Types.ObjectId()}`)
                .send({ title: 'Unauthorized Update' });

            expect(res.status).toBe(401);
        });
    });

    // ── PATCH /api/v1/issues/:id/status — Update Status ─────────────────
    describe('PATCH /api/v1/issues/:id/status — Update Status', () => {

        it('TC-I-19 | should allow admin to move issue Pending → In Progress', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'In Progress', comment: 'Assigned to maintenance team' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('In Progress');
        });

        it('TC-I-20 | should return 403 when citizen tries to change status', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ status: 'In Progress', comment: 'Citizen trying to change status' });

            expect(res.status).toBe(403);
        });

        it('TC-I-21 | should return 400 for invalid status transition (Resolved → In Progress)', async () => {
            // Create and move to Resolved first
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'In Progress', comment: 'step 1' });

            await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Resolved', comment: 'step 2' });

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'In Progress', comment: 'invalid rollback' });

            expect(res.status).toBe(400);
        });

        it('TC-I-22 | should allow official to resolve an In Progress issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'In Progress', comment: 'Starting work' });

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/status`)
                .set('Authorization', `Bearer ${officialToken}`)
                .send({ status: 'Resolved', comment: 'Done!' });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('Resolved');
        });
    });

    // ── PATCH /api/v1/issues/:id/withdraw ───────────────────────────────
    describe('PATCH /api/v1/issues/:id/withdraw — Withdraw Issue', () => {

        it('TC-I-23 | should allow reporter to withdraw their own Pending issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/withdraw`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('Withdrawn');
        });

        it('TC-I-24 | should return 403 when another user tries to withdraw', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;
            const otherToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: 'citizen' });

            const res = await request(app)
                .patch(`/api/v1/issues/${id}/withdraw`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
        });
    });

    // ── POST /api/v1/issues/:id/comments ─────────────────────────────────
    describe('POST /api/v1/issues/:id/comments — Add Comment', () => {

        it('TC-I-25 | should allow admin to add a comment', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .post(`/api/v1/issues/${id}/comments`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ text: 'We are dispatching a team.' });

            expect(res.status).toBe(200);
            expect(res.body.data.comments).toHaveLength(1);
            expect(res.body.data.comments[0].text).toBe('We are dispatching a team.');
        });

        it('TC-I-26 | should return 403 when citizen tries to add comment', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .post(`/api/v1/issues/${id}/comments`)
                .set('Authorization', `Bearer ${citizenToken}`)
                .send({ text: 'Citizen comment attempt' });

            expect(res.status).toBe(403);
        });

        it('TC-I-27 | should return 400 when comment text is missing', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .post(`/api/v1/issues/${id}/comments`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    // ── DELETE /api/v1/issues/:id ─────────────────────────────────────────
    describe('DELETE /api/v1/issues/:id — Delete Issue', () => {

        it('TC-I-28 | should allow reporter to delete their own issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/issues/${id}`)
                .set('Authorization', `Bearer ${citizenToken}`);

            expect(res.status).toBe(200);
        });

        it('TC-I-29 | should allow admin to delete any issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;

            const res = await request(app)
                .delete(`/api/v1/issues/${id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });

        it('TC-I-30 | should return 403 when another citizen tries to delete someone else\'s issue', async () => {
            const create = await request(app)
                .post('/api/v1/issues')
                .set('Authorization', `Bearer ${citizenToken}`)
                .send(validIssuePayload);

            const id = create.body.data._id;
            const otherToken = signToken({ id: new mongoose.Types.ObjectId().toString(), role: 'citizen' });

            const res = await request(app)
                .delete(`/api/v1/issues/${id}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
        });

        it('TC-I-31 | should return 404 when deleting a non-existent issue', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();

            const res = await request(app)
                .delete(`/api/v1/issues/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });

        it('TC-I-32 | should return 401 when unauthenticated user tries to delete', async () => {
            const res = await request(app)
                .delete(`/api/v1/issues/${new mongoose.Types.ObjectId()}`);

            expect(res.status).toBe(401);
        });
    });
});
