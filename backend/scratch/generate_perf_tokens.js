import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const secret = process.env.JWT_SECRET || 'mysupersecretkey123';
const expiry = '30d';

const citizenPayload = { id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'citizen' };
const adminPayload = { id: '64f1a2b3c4d5e6f7a8b9c0d2', role: 'admin' };

const citizenToken = jwt.sign(citizenPayload, secret, { expiresIn: expiry });
const adminToken = jwt.sign(adminPayload, secret, { expiresIn: expiry });

console.log('CITIZEN_TOKEN=' + citizenToken);
console.log('ADMIN_TOKEN=' + adminToken);
