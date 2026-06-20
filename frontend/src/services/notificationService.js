import api from './api';

const notificationService = {
  getList: (params) => api.get('/notifications', { params }).then(r => r.data),
  getUnreadCount: () => api.get('/notifications/count').then(r => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.put('/notifications/read-all').then(r => r.data),
};

export default notificationService;
