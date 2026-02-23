import express from 'express';
import {
    createInitiative,
    getAllInitiatives,
    getInitiativeById,
    updateInitiative,
    deleteInitiative
} from '../controllers/greenInitiative.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Adjust if auth middleware is exported differently

const router = express.Router();

router.route('/')
    .post(protect, createInitiative)
    .get(getAllInitiatives);

router.route('/:id')
    .get(getInitiativeById)
    .put(protect, updateInitiative)
    .delete(protect, deleteInitiative);

export default router;