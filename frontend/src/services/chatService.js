import api from './api';

const chatService = {
  getRooms: () => api.get('/chat/rooms').then(r => r.data),
  createRoom: (data) => api.post('/chat/rooms', data).then(r => r.data),
  getOrCreateDirect: (targetUserId) => api.post('/chat/rooms/direct', { targetUserId }).then(r => r.data),
  getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }).then(r => r.data),
  markRead: (roomId) => api.put(`/chat/rooms/${roomId}/read`).then(r => r.data),
};

export default chatService;
