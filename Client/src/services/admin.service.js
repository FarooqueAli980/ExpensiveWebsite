import api from '../api/axios';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateAdminUser = (id, payload) => api.patch(`/admin/users/${id}`, payload);
