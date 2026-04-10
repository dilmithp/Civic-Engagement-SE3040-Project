import api from '../api/axios.config';
import { ENDPOINTS } from '../api/endpoints';

const greenInitiativeService = {
    // Get all initiatives
    getAllInitiatives: () => {
        return api.get(ENDPOINTS.GREEN_INITIATIVES);
    },

    // Get a single initiative by ID
    getInitiativeById: (id) => {
        return api.get(`${ENDPOINTS.GREEN_INITIATIVES}/${id}`);
    },

    // Create a new initiative (Automatically uses the token interceptor)
    createInitiative: (initiativeData) => {
        return api.post(ENDPOINTS.GREEN_INITIATIVES, initiativeData);
    },

    // Update an initiative (Automatically uses the token interceptor)
    updateInitiative: (id, updatedData) => {
        return api.put(`${ENDPOINTS.GREEN_INITIATIVES}/${id}`, updatedData);
    },

    // Delete an initiative (Automatically uses the token interceptor)
    deleteInitiative: (id) => {
        return api.delete(`${ENDPOINTS.GREEN_INITIATIVES}/${id}`);
    }
};

export default greenInitiativeService;