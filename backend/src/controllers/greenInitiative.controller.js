import GreenInitiative from '../models/GreenInitiative.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create a new green initiative
// @route   POST /api/v1/green-initiatives
// @access  Private
export const createInitiative = asyncHandler(async (req, res, next) => {
    req.body.organizer = req.user.id; // Will now save as Number 19

    const initiative = await GreenInitiative.create(req.body);

    sendSuccess(res, 201, initiative, 'Initiative created successfully');
});

// @desc    Get all green initiatives
// @route   GET /api/v1/green-initiatives
// @access  Public
export const getAllInitiatives = asyncHandler(async (req, res, next) => {
    // Removed .populate() because users are in SQL now
    const initiatives = await GreenInitiative.find().sort('-createdAt');

    sendSuccess(res, 200, initiatives, 'Initiatives retrieved successfully');
});

// @desc    Get a single green initiative
// @route   GET /api/v1/green-initiatives/:id
// @access  Public
export const getInitiativeById = asyncHandler(async (req, res, next) => {
    // Removed .populate() because users are in SQL now
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    sendSuccess(res, 200, initiative, 'Initiative retrieved successfully');
});

// @desc    Update a green initiative
// @route   PUT /api/v1/green-initiatives/:id
// @access  Private (Only organizer)
// @desc    Update a green initiative
// @route   PUT /api/v1/green-initiatives/:id
// @access  Private (Only organizer)
export const updateInitiative = asyncHandler(async (req, res, next) => {
    let initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    // DEBUG ERROR MESSAGE: This will print the IDs to Postman!
    if (String(initiative.organizer) !== String(req.user.id) && req.user.role !== 'admin') {
        return res.status(403).json({
            status: 'fail',
            message: `DEBUG MISMATCH: Database saved organizer as '${initiative.organizer}', but your token says you are '${req.user.id}'.`
        });
    }

    initiative = await GreenInitiative.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sendSuccess(res, 200, initiative, 'Initiative updated successfully');
});

// @desc    Delete a green initiative
// @route   DELETE /api/v1/green-initiatives/:id
// @access  Private (Only organizer)
export const deleteInitiative = asyncHandler(async (req, res, next) => {
    const initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    if (String(initiative.organizer) !== String(req.user.id) && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this initiative', 403));
    }

    await GreenInitiative.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, null, 'Initiative deleted successfully');
});