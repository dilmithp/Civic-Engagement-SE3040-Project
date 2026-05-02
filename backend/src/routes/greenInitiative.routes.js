import express from 'express';
import {
    createInitiative,
    getAllInitiatives,
    getInitiativeById,
    updateInitiative,
    deleteInitiative,
    uploadCompletionImages,
    deleteCompletionImage
} from '../controllers/greenInitiative.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadInitiative } from '../config/cloudinary.config.js';

const router = express.Router();

router.route('/')
    .post(protect, createInitiative)
    .get(getAllInitiatives);

router.route('/:id')
    .get(getInitiativeById)
    .put(protect, updateInitiative)
    .delete(protect, deleteInitiative);

// Upload or delete completion images
router.route('/:id/images')
    .post(protect, uploadInitiative.array('images', 5), uploadCompletionImages);

router.route('/:id/images/:imageId')
    .delete(protect, deleteCompletionImage);

export default router;