import api from '../api/axios';

export const getTransactions = () => api.get('/transactions');
export const createTransaction = (payload) => api.post('/transactions', payload);
export const getTransactionById = (id) => api.get(`/transactions/${id}`);
export const updateTransaction = (id, payload) => api.put(`/transactions/${id}`, payload);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
