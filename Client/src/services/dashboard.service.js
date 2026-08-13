import api from '../api/axios';

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getRecentTransactions = () => api.get('/dashboard/recent');
export const getIncomeExpense = () => api.get('/dashboard/income-expense');
export const getMonthlyAnalytics = () => api.get('/dashboard/monthly');
export const getExpenseByCategory = () => api.get('/dashboard/expense-category');
