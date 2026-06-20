import api from './api';

const boardService = {
  getBoards: () => api.get('/boards').then(r => r.data),
  getPosts: (boardId, params) => api.get(`/boards/${boardId}/posts`, { params }).then(r => r.data),
  getPost: (id) => api.get(`/posts/${id}`).then(r => r.data),
  createPost: (boardId, data) => api.post(`/boards/${boardId}/posts`, data).then(r => r.data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data).then(r => r.data),
  deletePost: (id) => api.delete(`/posts/${id}`).then(r => r.data),
  getComments: (postId) => api.get(`/posts/${postId}/comments`).then(r => r.data),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data).then(r => r.data),
  deleteComment: (id) => api.delete(`/comments/${id}`).then(r => r.data),
};
export default boardService;
