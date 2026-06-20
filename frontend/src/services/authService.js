import api from './api';

const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post('/auth/logout').catch(() => {}),
};

export default authService;
