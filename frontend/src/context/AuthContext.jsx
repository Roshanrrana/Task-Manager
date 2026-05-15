import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import AuthContext from './auth-context';

const TOKEN_KEY = 'taskpilot_token';
const USER_KEY = 'taskpilot_user';
const LEGACY_TOKEN_KEY = 'taskflow_token';
const LEGACY_USER_KEY = 'taskflow_user';

const getInitialToken = () => {
  const currentToken = localStorage.getItem(TOKEN_KEY);
  if (currentToken) return currentToken;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (legacyToken) {
    localStorage.setItem(TOKEN_KEY, legacyToken);
    if (legacyUser) localStorage.setItem(USER_KEY, legacyUser);
  }
  return legacyToken;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getInitialToken);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    [TOKEN_KEY, USER_KEY, LEGACY_TOKEN_KEY, LEGACY_USER_KEY].forEach((key) => {
      localStorage.removeItem(key);
    });
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/users/profile');
          setUser(data);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token, logout]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  };

  const signup = async (name, email, password, role) => {
    const { data } = await API.post('/auth/signup', { name, email, password, role });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
