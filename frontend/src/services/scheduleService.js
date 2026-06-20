import api from './api';

const scheduleService = {
  getList: (params) => api.get('/schedules', { params }).then(r => r.data),
  getById: (id) => api.get(`/schedules/${id}`).then(r => r.data),
  create: (data) => api.post('/schedules', data).then(r => r.data),
  update: (id, data) => api.put(`/schedules/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/schedules/${id}`).then(r => r.data),
  getTeamSchedules: (params) => api.get('/schedules/team', { params }).then(r => r.data),
  getRooms: () => api.get('/meeting-rooms').then(r => r.data),
  getRoomBookings: (roomId, params) => api.get(`/meeting-rooms/${roomId}/bookings`, { params }).then(r => r.data),
  bookRoom: (roomId, data) => api.post(`/meeting-rooms/${roomId}/bookings`, data).then(r => r.data),
  cancelBooking: (id) => api.delete(`/room-bookings/${id}`).then(r => r.data),
};
export default scheduleService;
