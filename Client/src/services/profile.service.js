import api from '../api/axios';

export const fetchProfile = () => api.get('/auth/profile');
export const updateProfile = (payload) => api.put('/auth/profile', payload);
export const changePassword = (payload) => api.put('/auth/profile/password', payload);
export const deleteAccount = () => api.delete('/auth/profile');
