import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 앱 시작 시 localStorage에서 세션 복원 */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* 로그인 */
  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      const response = await authService.login(username, password);
      const data = response.data?.data || response.data;
      if (data) {
        const userObj = data.user || {
          id: data.id,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
        };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || '로그인 실패');
      throw err;
    }
  }, []);

  /* 로그아웃 */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('로그아웃 오류:', err);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }, []);

  /* 유저 정보 업데이트 */
  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
