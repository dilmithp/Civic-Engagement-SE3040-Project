import api from '../api/axios.config';
import { ENDPOINTS } from '../api/endpoints';

export const issueService = {
  // Get paginated public issues feed with optional filters
  getPublicIssues: async (params = {}) => {
    return await api.get(ENDPOINTS.ISSUES.BASE, { params });
  },

  // Get current citizen's reports
  getMyIssues: async (params = {}) => {
    return await api.get(ENDPOINTS.ISSUES.MY_ISSUES, { params });
  },

  // Get a single issue by ID
  getIssueById: async (id) => {
    return await api.get(`${ENDPOINTS.ISSUES.BASE}/${id}`);
  },

  // Create a new issue (handles FormData for image uploads)
  createIssue: async (formData) => {
    return await api.post(ENDPOINTS.ISSUES.BASE, formData);
  },

  // Update an existing issue text content (Edit Mode)
  updateIssue: async (id, data) => {
    return await api.put(`${ENDPOINTS.ISSUES.BASE}/${id}`, data);
  },

  // Update status (Admin/Official only)
  updateStatus: async (id, statusData) => {
    return await api.patch(`${ENDPOINTS.ISSUES.BASE}/${id}/status`, statusData);
  },

  // Withdraw an issue
  withdrawIssue: async (id) => {
    return await api.patch(`${ENDPOINTS.ISSUES.BASE}/${id}/withdraw`);
  },

  // Delete an issue
  deleteIssue: async (id) => {
    return await api.delete(`${ENDPOINTS.ISSUES.BASE}/${id}`);
  },

  // Add a comment (Admin/Official only)
  addComment: async (id, commentData) => {
    return await api.post(`${ENDPOINTS.ISSUES.BASE}/${id}/comments`, commentData);
  },

  // Geocoding
  reverseGeocode: async (lat, lng) => {
    return await api.get(`${ENDPOINTS.GEOCODE.REVERSE}?lat=${lat}&lng=${lng}`);
  },

  forwardGeocode: async (address) => {
    return await api.get(`${ENDPOINTS.GEOCODE.FORWARD}?address=${encodeURIComponent(address)}`);
  }
};
