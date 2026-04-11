import * as DashboardService from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await DashboardService.getDashboardStats();
  sendSuccess(res, 200, stats, 'Dashboard stats fetched successfully');
});
