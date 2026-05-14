import axios from 'axios';

// Local dev uses '/api'. Production can set VITE_API_URL to a deployed API root.
const baseURL = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) || '/api';

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token');
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
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
