import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8083/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/* ===== Refresh Token 관리 ===== */
let isTokenRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  if (isTokenRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isTokenRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const itsmBaseUrl = process.env.REACT_APP_ITSM_API_URL || 'http://localhost:8082/api';
      const response = await axios.post(
        `${itsmBaseUrl}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      );

      const data = response.data?.data || response.data;
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return null;
    } finally {
      isTokenRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ===== 요청 인터셉터: JWT 토큰 자동 추가 ===== */
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===== 응답 인터셉터: 401 → 토큰 갱신 시도 ===== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
