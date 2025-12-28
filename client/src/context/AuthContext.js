import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasVerifiedCode, setHasVerifiedCode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.valid) {
          setUser(response.data);
          setIsAuthenticated(true);
          const codeVerified = localStorage.getItem('codeVerified') === 'true';
          setHasVerifiedCode(codeVerified);
        } else {
          // Token geçersiz
          localStorage.removeItem('token');
          localStorage.removeItem('codeVerified');
          setUser(null);
          setIsAuthenticated(false);
          setHasVerifiedCode(false);
        }
      } catch (error) {
        // Sadece 401 (Unauthorized) hatası durumunda token'ı temizle
        // Network hatalarında token'ı koru
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('codeVerified');
          setUser(null);
          setIsAuthenticated(false);
          setHasVerifiedCode(false);
        }
        // Network hatası gibi durumlarda token'ı koruyoruz
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });
      const { token, userId, username: userUsername } = response.data;
      localStorage.setItem('token', token);
      setUser({ userId, username: userUsername });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // Daha detaylı hata mesajları
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return { 
          success: false, 
          error: 'Sunucuya bağlanılamıyor. Sunucunun çalıştığından emin olun.' 
        };
      }
      if (error.response) {
        // Sunucudan gelen hata
        return { 
          success: false, 
          error: error.response.data?.error || 'Giriş hatası' 
        };
      }
      return { 
        success: false, 
        error: error.message || 'Giriş hatası oluştu' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });
      const { token, userId, username: userUsername } = response.data;
      localStorage.setItem('token', token);
      setUser({ userId, username: userUsername });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      // Daha detaylı hata mesajları
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return { 
          success: false, 
          error: 'Sunucuya bağlanılamıyor. Sunucunun çalıştığından emin olun.' 
        };
      }
      if (error.response) {
        // Sunucudan gelen hata
        return { 
          success: false, 
          error: error.response.data?.error || 'Kayıt hatası' 
        };
      }
      return { 
        success: false, 
        error: error.message || 'Kayıt hatası oluştu' 
      };
    }
  };

  const verifyCode = async (code) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/codes/verify`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.valid) {
        localStorage.setItem('codeVerified', 'true');
        setHasVerifiedCode(true);
        return { success: true };
      }
      return { success: false, error: 'Kod doğrulanamadı' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Kod doğrulama hatası' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('codeVerified');
    setUser(null);
    setIsAuthenticated(false);
    setHasVerifiedCode(false);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        hasVerifiedCode,
        loading,
        login,
        register,
        verifyCode,
        logout,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

