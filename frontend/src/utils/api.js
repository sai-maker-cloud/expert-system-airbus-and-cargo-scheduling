import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(msg));
  }
);

export const flightApi = {
  getAll: () => api.get('/flights'),
  getById: (id) => api.get(`/flights/${id}`),
  create: (data) => api.post('/flights', data),
  update: (id, data) => api.put(`/flights/${id}`, data),
  delete: (id) => api.delete(`/flights/${id}`),
  assignAircraft: (flightId, aircraftId) => api.post(`/flights/${flightId}/assign-aircraft/${aircraftId}`),
  assignCrew: (flightId, crewId) => api.post(`/flights/${flightId}/assign-crew/${crewId}`),
  removeCrew: (flightId, crewId) => api.delete(`/flights/${flightId}/remove-crew/${crewId}`),
  updateStatus: (id, status) => api.patch(`/flights/${id}/status?status=${status}`),
};

export const aircraftApi = {
  getAll: () => api.get('/aircraft'),
  getById: (id) => api.get(`/aircraft/${id}`),
  getAvailable: () => api.get('/aircraft/available'),
  create: (data) => api.post('/aircraft', data),
  update: (id, data) => api.put(`/aircraft/${id}`, data),
  delete: (id) => api.delete(`/aircraft/${id}`),
  updateStatus: (id, status) => api.patch(`/aircraft/${id}/status?status=${status}`),
};

export const crewApi = {
  getAll: () => api.get('/crew'),
  getById: (id) => api.get(`/crew/${id}`),
  getAvailable: () => api.get('/crew/available'),
  create: (data) => api.post('/crew', data),
  update: (id, data) => api.put(`/crew/${id}`, data),
  delete: (id) => api.delete(`/crew/${id}`),
  updateStatus: (id, status) => api.patch(`/crew/${id}/status?status=${status}`),
};

export const cargoApi = {
  getAll: () => api.get('/cargo'),
  getById: (id) => api.get(`/cargo/${id}`),
  getPending: () => api.get('/cargo/pending'),
  create: (data) => api.post('/cargo', data),
  update: (id, data) => api.put(`/cargo/${id}`, data),
  delete: (id) => api.delete(`/cargo/${id}`),
  assignToFlight: (cargoId, flightId) => api.post(`/cargo/${cargoId}/assign/${flightId}`),
  unassign: (cargoId) => api.delete(`/cargo/${cargoId}/unassign`),
};

export const agentApi = {
  suggestAircraft: (flightId) => api.get(`/agent/suggest-aircraft/${flightId}`),
  suggestCrew: (flightId) => api.get(`/agent/suggest-crew/${flightId}`),
  optimizeCargo: () => api.post('/agent/optimize-cargo'),
  detectConflicts: () => api.get('/agent/detect-conflicts'),
  predictDelays: () => api.get('/agent/predict-delays'),
};

export const rulesApi = {
  getAll: () => api.get('/rules'),
  create: (data) => api.post('/rules', data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  toggle: (id) => api.patch(`/rules/${id}/toggle`),
  delete: (id) => api.delete(`/rules/${id}`),
};

export default api;
