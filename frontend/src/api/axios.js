import axios from 'axios';

// Local dev uses '/api'. Production can set VITE_API_URL to a deployed API root.
const baseURL = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || '/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEYS = ['taskpilot_token', 'taskflow_token'];
const USER_KEYS = ['taskpilot_user', 'taskflow_user'];

API.interceptors.request.use(
  (config) => {
    const token = TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      [...TOKEN_KEYS, ...USER_KEYS].forEach((key) => localStorage.removeItem(key));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
