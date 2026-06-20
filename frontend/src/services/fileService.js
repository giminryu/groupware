import api from './api';

const fileService = {
  getList: (params) => api.get('/files', { params }).then(r => r.data),
  getById: (id) => api.get(`/files/${id}`).then(r => r.data),
  upload: (formData) => api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  createFolder: (data) => api.post('/files/folder', data).then(r => r.data),
  update: (id, data) => api.put(`/files/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/files/${id}`).then(r => r.data),
  download: async (id, filename) => {
    const res = await api.get(`/files/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  },
};
export default fileService;
