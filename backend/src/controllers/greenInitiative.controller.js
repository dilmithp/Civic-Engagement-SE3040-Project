import GreenInitiative from '../models/GreenInitiative.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

// @desc    Create a new green initiative
// @route   POST /api/v1/green-initiatives
// @access  Private
export const createInitiative = asyncHandler(async (req, res, next) => {
    req.body.organizer = req.user.id;

    // SCENARIO 2: If user is an Official (or Admin), mark the event as officially endorsed
    if (req.user.role === 'official' || req.user.role === 'admin') {
        req.body.isOfficial = true;
    } else {
        // Prevent normal citizens from hacking the body payload to get a badge
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
export const updateInitiative = asyncHandler(async (req, res, next) => {
    let initiative = await GreenInitiative.findById(req.params.id);

    if (!initiative) {
        return next(new AppError('Initiative not found', 404));
    }

    // SCENARIO 1: Admin God Mode. Allow update if user is the organizer OR an admin
    if (initiative.organizer !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to update this initiative', 403));
    }

    // Security: Only allow officials/admins to manually toggle the isOfficial flag during an update
    if (req.user.role !== 'official' && req.user.role !== 'admin') {
        delete req.body.isOfficial;
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
    if (initiative.organizer !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('Not authorized to delete this initiative', 403));
    }

    await GreenInitiative.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, null, 'Initiative deleted successfully');
});