import GreenInitiative from '../models/GreenInitiative.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';
import { fetchWeatherForEvent } from '../utils/weather.service.js';
import { cloudinary } from '../config/cloudinary.config.js';

// @desc    Create a new green initiative
// @route   POST /api/v1/green-initiatives
// @access  Private

export const createInitiative = asyncHandler(async (req, res, next) => {
    req.body.organizer = req.user.id; 

    // Fetch weather based on location and date
    if (req.body.location && req.body.date) {
        const weatherData = await fetchWeatherForEvent(req.body.location, req.body.date);
        
        if (weatherData) {
            req.body.weatherForecast = weatherData;

            // Role Logic: If it's an Official or Admin and the weather is bad, add a warning
            const badWeather = ['Rain', 'Thunderstorm', 'Snow', 'Extreme'];
            if ((req.user.role === 'official' || req.user.role === 'admin') && badWeather.includes(weatherData.condition)) {
                req.body.status = 'Upcoming (Weather Alert)'; 
            }
        }
    }

    // Role Logic: Enforce official status based on user role
    if (req.user.role === 'official' || req.user.role === 'admin') {
        req.body.isOfficial = true;
    } else {
        req.body.isOfficial = false;
    }

    if (req.user.role === 'official' || req.user.role === 'admin') {
        req.body.isOfficial = true;
    } else {
        // Prevent normal citizens from hacking the body payload
        req.body.isOfficial = false;
    }

    const initiative = await GreenInitiative.create(req.body);

    sendSuccess(res, 201, initiative, 'Initiative created successfully');
});
// @desc    Get all green initiatives
// @route   GET /api/v1/green-initiatives
// @access  Public
export const getAllInitiatives = asyncHandler(async (req, res, next) => {
    const initiatives = await GreenInitiative.find().sort('-createdAt');
    sendSuccess(res, 200, initiatives, 'Initiatives retrieved successfully');
});

// @desc    Get a single green initiative
// @route   GET /api/v1/green-initiatives/:id
// @access  Public
export const getInitiativeById = asyncHandler(async (req, res, next) => {
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    sendSuccess(res, 200, initiative, 'Initiative retrieved successfully');
});

// @desc    Update a green initiative
// @route   PUT /api/v1/green-initiatives/:id
// @access  Private
// @desc    Update a green initiative
// @route   PUT /api/v1/green-initiatives/:id
// @access  Private (Only organizer)
export const updateInitiative = asyncHandler(async (req, res, next) => {
    let initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    if (String(initiative.organizer) !== String(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            message: `DEBUG MISMATCH: Database saved organizer as '${initiative.organizer}', but your token says you are '${req.user.id}'.`
        });
    }
    if (req.user.role !== 'official' && req.user.role !== 'admin') {
        delete req.body.isOfficial;
    }

    if (req.user.role !== 'official' && req.user.role !== 'admin') {
        delete req.body.isOfficial;
    }

    // 🟢 NEW: Re-fetch weather if the date or location is being changed
    if (req.body.location || req.body.date) {
        const targetLocation = req.body.location || initiative.location;
        const targetDate = req.body.date || initiative.date;
        
        const weatherData = await fetchWeatherForEvent(targetLocation, targetDate);
        if (weatherData) {
            req.body.weatherForecast = weatherData;
        }
    }

    initiative = await GreenInitiative.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendSuccess(res, 200, initiative, 'Initiative updated successfully');
});

// @desc    Delete a green initiative
// @route   DELETE /api/v1/green-initiatives/:id
// @access  Private
export const deleteInitiative = asyncHandler(async (req, res, next) => {
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    // SCENARIO 1: Admin God Mode. Admins bypass the organizer check.
    if (initiative.organizer.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this initiative', 403));
    }

    await GreenInitiative.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, null, 'Initiative deleted successfully');
});

// @desc    Upload completion images for a completed initiative
// @route   POST /api/v1/green-initiatives/:id/images
// @access  Private (organizer or admin only)
export const uploadCompletionImages = asyncHandler(async (req, res, next) => {
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    // Only allow uploads for completed initiatives
    if (initiative.status !== 'Completed') {
        return next(new AppError('Images can only be uploaded for Completed initiatives', 400));
    }

    // Only the organizer or an admin can upload
    if (String(initiative.organizer) !== String(req.user.id) && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to upload images for this initiative', 403));
    }

    if (!req.files || req.files.length === 0) {
        return next(new AppError('No images were uploaded', 400));
    }

    // Map multer-cloudinary files to our schema shape
    const newImages = req.files.map((file) => ({
        url:      file.path,      // Cloudinary secure URL
        publicId: file.filename   // Cloudinary public_id (used for deletion later)
    }));

    initiative.completionImages.push(...newImages);
    await initiative.save();

    sendSuccess(res, 200, initiative, 'Completion images uploaded successfully');
});

// @desc    Delete a single completion image from a completed initiative
// @route   DELETE /api/v1/green-initiatives/:id/images/:imageId
// @access  Private (organizer or admin only)
export const deleteCompletionImage = asyncHandler(async (req, res, next) => {
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    // Only the organizer or an admin can delete images
    if (String(initiative.organizer) !== String(req.user.id) && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete images for this initiative', 403));
    }

    // Find the image subdocument by its MongoDB _id
    const image = initiative.completionImages.id(req.params.imageId);
    if (!image) {
        return next(new AppError('Image not found', 404));
    }

    // Remove from Cloudinary
    if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
    }

    // Pull the subdoc from the array and persist
    image.deleteOne();
    await initiative.save();

    sendSuccess(res, 200, initiative, 'Image deleted successfully');
});