import api from '../api/axios.config';
import { ENDPOINTS } from '../api/endpoints';

export const marketplaceService = {
  getListings: async (params = {}) => {
    return await api.get(ENDPOINTS.MARKETPLACE.BASE, { params });
  },

  getMyListings: async (params = {}) => {
    return await api.get(ENDPOINTS.MARKETPLACE.MINE, { params });
  },

  getListingById: async (id) => {
    return await api.get(`${ENDPOINTS.MARKETPLACE.BASE}/${id}`);
  },

  createListing: async (data) => {
    if (data instanceof FormData) {
      return await api.post(ENDPOINTS.MARKETPLACE.BASE, data);
    }

    return await api.post(ENDPOINTS.MARKETPLACE.BASE, data);
  },

  updateListing: async (id, data) => {
    if (data instanceof FormData) {
      return await api.patch(`${ENDPOINTS.MARKETPLACE.BASE}/${id}`, data);
    }

    return await api.patch(`${ENDPOINTS.MARKETPLACE.BASE}/${id}`, data);
  },

  updateStatus: async (id, status) => {
    return await api.patch(`${ENDPOINTS.MARKETPLACE.BASE}/${id}/status`, { status });
  },

  deleteListing: async (id) => {
    return await api.delete(`${ENDPOINTS.MARKETPLACE.BASE}/${id}`);
  }
};
