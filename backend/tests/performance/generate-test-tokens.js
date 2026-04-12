/**
 * generate-test-tokens.js
 * ─────────────────────────────────────────────────────────────────────────
 * Helper script to generate JWT tokens for use in Artillery performance tests.
 * Run with: node generate-test-tokens.js
 *
 * These tokens use the same JWT_SECRET as the backend, so they will be
 * accepted by the auth middleware during performance testing.
 *
 * USAGE:
 *   1. Copy this file to the backend root (or run from there)
 *   2. node tests/performance/generate-test-tokens.js
 *   3. Paste the printed tokens into issue.performance.yml variables
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET not found in .env — check your backend/.env file');
    process.exit(1);
}

// These are dummy IDs for load testing — not real user IDs from the DB
const PERF_CITIZEN_ID = 'perf-citizen-load-test-user';
const PERF_ADMIN_ID = 'perf-admin-load-test-user';

const citizenToken = jwt.sign(
    { id: PERF_CITIZEN_ID, role: 'citizen' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
);

const adminToken = jwt.sign(
    { id: PERF_ADMIN_ID, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
);

console.log('\n✅ Generated JWT tokens for Artillery performance testing:\n');
console.log('─'.repeat(70));
console.log('CITIZEN TOKEN (paste as citizenToken in issue.performance.yml):');
console.log(citizenToken);
console.log('\n' + '─'.repeat(70));
console.log('ADMIN TOKEN (paste as adminToken in issue.performance.yml):');
console.log(adminToken);
console.log('─'.repeat(70));
console.log('\n📋 Update your tests/performance/issue.performance.yml variables section:');
console.log(`
  variables:
    citizenToken: "${citizenToken}"
    adminToken: "${adminToken}"
`);
