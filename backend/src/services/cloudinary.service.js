import { cloudinary } from '../config/cloudinary.config.js';

/**
 * CloudinaryService — Single Responsibility: handles all image upload/delete operations.
 * Dependency Inversion: controller/service depends on this abstraction, not the SDK directly.
 * Can be swapped for S3Service, LocalStorageService, etc. without changing consumers.
 */
class CloudinaryService {
    /**
     * Extract image data from multer-uploaded files (already uploaded to Cloudinary via storage engine).
     * @param {Array} files - Multer file objects with path and filename
     * @returns {Array<{url: string, publicId: string}>}
     */
    static extractUploadedImages(files) {
        if (!files || files.length === 0) return [];

        return files.map((file) => ({
            url: file.path,
            publicId: file.filename
        }));
    }

    /**
     * Delete a single image from Cloudinary by its public ID.
     * @param {string} publicId
     * @returns {Promise<object>} Cloudinary deletion result
     */
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            console.error(`Failed to delete image ${publicId}:`, error.message);
            throw error;
        }
    }

    /**
     * Delete multiple images from Cloudinary.
     * @param {Array<string>} publicIds
     * @returns {Promise<Array>} Array of deletion results
     */
    static async deleteImages(publicIds) {
        if (!publicIds || publicIds.length === 0) return [];

        const deletePromises = publicIds.map((id) => this.deleteImage(id));
        return Promise.allSettled(deletePromises);
    }
}

export default CloudinaryService;
