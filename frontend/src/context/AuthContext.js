import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

const authStates = {
  authenticated: 1,
  unauthenticated: 2,
  loading: 3
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(authStates.loading);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/auth/me`)
        .then(res => {
          setUser(res.data);
          setAuthState(authStates.authenticated);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setAuthState(authStates.unauthenticated);
        });
    } else {
      setAuthState(authStates.unauthenticated);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    setAuthState(authStates.authenticated);
  };

  const register = async (username, email, password, fullName) => {
    const res = await axios.post(`${API_URL}/auth/register`, { username, email, password, fullName });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setUser(userData);
    setAuthState(authStates.authenticated);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthState(authStates.unauthenticated);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ authState, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { authStates };
