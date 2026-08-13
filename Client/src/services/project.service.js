import api from '../api/axios';

export const getProjects = () => api.get('/projects');
export const createProject = (payload) => api.post('/projects', payload);
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const getProjectSummary = (id) => api.get(`/projects/${id}/summary`);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
