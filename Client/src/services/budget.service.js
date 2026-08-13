import api from '../api/axios';

export const getBudgets = () => api.get('/budgets');
export const createBudget = (payload) => api.post('/budgets', payload);
export const updateBudget = (id, payload) => api.put(`/budgets/${id}`, payload);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
export const getBudgetSummary = (month, year, project) => api.get(`/budgets/summary/${month}/${year}`, { params: project ? { project } : {} });
