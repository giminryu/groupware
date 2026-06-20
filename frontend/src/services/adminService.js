import api from './api';

const adminService = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getUsers: () => api.get('/admin/users').then(r => r.data),
  updateUserProfile: (id, data) => api.put(`/admin/users/${id}/profile`, data).then(r => r.data),
  getDepartments: () => api.get('/admin/departments').then(r => r.data),
  createDepartment: (data) => api.post('/admin/departments', data).then(r => r.data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data).then(r => r.data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`).then(r => r.data),
  getPositions: () => api.get('/admin/positions').then(r => r.data),
  createPosition: (data) => api.post('/admin/positions', data).then(r => r.data),
  getBoards: () => api.get('/admin/boards').then(r => r.data),
  createBoard: (data) => api.post('/admin/boards', data).then(r => r.data),
  getMeetingRooms: () => api.get('/admin/meeting-rooms').then(r => r.data),
  createMeetingRoom: (data) => api.post('/admin/meeting-rooms', data).then(r => r.data),
};

export default adminService;
