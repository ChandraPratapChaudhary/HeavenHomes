import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      const userData = res.data.data || res.data;
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [token]);

  const login = async (loginDto) => {
    const res = await api.post('/auth/login', loginDto);
    const data = res.data.data || res.data;
    const accessToken = data.accessToken || data;
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);
    await fetchProfile();
    return data;
  };

  const signup = async (signUpDto) => {
    const res = await api.post('/auth/signup', signUpDto);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  const becomeHotelManager = async (secretCode) => {
    await api.patch('/users/becomeHotelManager', null, {
      params: { secretCode },
    });
    await fetchProfile();
  };

  const isManager = Boolean(user?.roles?.includes('HOTEL_MANAGER') || user?.roles?.includes('SUPER_ADMIN'));
  const isSuperAdmin = Boolean(user?.roles?.includes('SUPER_ADMIN'));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        fetchProfile,
        becomeHotelManager,
        isManager,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
