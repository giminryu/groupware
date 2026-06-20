import api from './api';

const approvalService = {
  getTemplates: () => api.get('/approval/templates').then(r => r.data),
  getDocuments: (params) => api.get('/approval/documents', { params }).then(r => r.data),
  getDocument: (id) => api.get(`/approval/documents/${id}`).then(r => r.data),
  create: (data) => api.post('/approval/documents', data).then(r => r.data),
  submit: (id) => api.put(`/approval/documents/${id}/submit`).then(r => r.data),
  approve: (id, data) => api.put(`/approval/documents/${id}/approve`, data).then(r => r.data),
  reject: (id, data) => api.put(`/approval/documents/${id}/reject`, data).then(r => r.data),
  delete: (id) => api.delete(`/approval/documents/${id}`).then(r => r.data),
  getPending: () => api.get('/approval/pending').then(r => r.data),
};

export default approvalService;
