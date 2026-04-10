import GeocodingService from '../services/geocoding.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @desc    Reverse geocode — convert coordinates to address
 * @route   GET /api/v1/geocode/reverse?lat=6.9271&lng=79.8612
 * @access  Public
 */
export const reverseGeocode = asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;

    const result = await GeocodingService.reverseGeocode(
        parseFloat(lat),
        parseFloat(lng)
    );

    sendSuccess(res, 200, result, 'Address retrieved successfully');
});

/**
 * @desc    Forward geocode — convert address to coordinates
 * @route   GET /api/v1/geocode/forward?address=Colombo
 * @access  Public
 */
export const forwardGeocode = asyncHandler(async (req, res) => {
    const { address } = req.query;

    const result = await GeocodingService.forwardGeocode(address);

    sendSuccess(res, 200, result, 'Coordinates retrieved successfully');
});
