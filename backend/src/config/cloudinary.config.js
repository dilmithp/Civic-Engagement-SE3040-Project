import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
} from './env.js';

// Configure Cloudinary SDK
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Configure Multer storage for Cloudinary
const issueStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'civic-engagement/issues',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    }
});

const marketplaceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'civic-engagement/marketplace',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    }
});

// File filter — only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Export configured multer upload middleware
export const uploadIssue = multer({
    storage: issueStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 5                    // Max 5 files per request
    }
});

export const uploadMarketplace = multer({
    storage: marketplaceStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 5                    // Max 5 files per request
    }
});

// Backward-compatible alias for existing routes
export const upload = uploadIssue;

export { cloudinary };
