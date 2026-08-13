import api from '../api/axios';

export const getRecurrings = () => api.get('/recurring');
export const createRecurring = (payload) => api.post('/recurring', payload);
export const updateRecurring = (id, payload) => api.put(`/recurring/${id}`, payload);
export const deleteRecurring = (id) => api.delete(`/recurring/${id}`);
export const pauseRecurring = (id) => api.post(`/recurring/${id}/pause`);
export const resumeRecurring = (id) => api.post(`/recurring/${id}/resume`);

export default {
  getRecurrings,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  pauseRecurring,
  resumeRecurring,
};
