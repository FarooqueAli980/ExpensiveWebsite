import api from '../api/axios';

export const getReports = (params) => api.get('/reports', { params });
export const searchReports = (keyword) => api.get('/reports/search', { params: { keyword } });
export const filterReportsByCategory = (id) => api.get(`/reports/category/${id}`);
export const filterReportsByType = (type) => api.get(`/reports/type/${type}`);
export const filterReportsByDate = (start, end) => api.get('/reports/date', { params: { start, end } });
