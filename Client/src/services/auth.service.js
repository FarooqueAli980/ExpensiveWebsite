import api from '../api/axios';

export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);
export const getProfile = () => api.get('/auth/profile');
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const resetPassword = (token, payload) => api.post(`/auth/reset-password/${token}`, payload);
// Email verification removed: resendVerification API is no longer available
