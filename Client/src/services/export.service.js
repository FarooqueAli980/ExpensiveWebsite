import api from '../api/axios';

const buildExportUrl = (endpoint, params) => {
  const url = new URL(endpoint, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

export const exportPdf = (params) => api.get(`/reports/export/pdf`, { params, responseType: 'blob' });
export const exportExcel = (params) => api.get(`/reports/export/excel`, { params, responseType: 'blob' });
export const exportCsv = (params) => api.get(`/reports/export/csv`, { params, responseType: 'blob' });

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
