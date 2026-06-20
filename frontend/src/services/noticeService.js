import api from './api';

const noticeService = {
  getList: (params) => api.get('/notices', { params }).then(r => r.data),
  getById: (id) => api.get(`/notices/${id}`).then(r => r.data),
  create: (data) => api.post('/notices', data).then(r => r.data),
  update: (id, data) => api.put(`/notices/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/notices/${id}`).then(r => r.data),
  markViewed: (id) => api.post(`/notices/${id}/view`).then(r => r.data),
};
export default noticeService;
