import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) {
          parsed.room_no = parsed.room_no || parsed.roomNumber;
          parsed.roomNumber = parsed.roomNumber || parsed.room_no;
        }
        setToken(savedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (endpoint, credentials) => {
    const res = await api.post(endpoint, credentials);
    const payload = res.data || res;
    const newToken = payload.token;
    const userData = payload.user;

    if (userData) {
      userData.room_no = userData.room_no || userData.roomNumber;
      userData.roomNumber = userData.roomNumber || userData.room_no;
    }

    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setToken(newToken);
    setUser(userData);
    return userData;
  }, []);

  const signup = useCallback(async (endpoint, userDataPayload) => {
    const res = await api.post(endpoint, userDataPayload);
    const payload = res.data || res;
    const newToken = payload.token;
    const newUser = payload.user;

    if (newUser) {
      newUser.room_no = newUser.room_no || newUser.roomNumber;
      newUser.roomNumber = newUser.roomNumber || newUser.room_no;
    }

    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token && !!user,
    isStudent: user?.role === 'student',
    isWarden: user?.role === 'warden',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
