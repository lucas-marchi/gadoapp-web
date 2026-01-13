import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gadoapp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.warn('Token expirado ou inválido. Deslogando...');
      
      localStorage.removeItem('gadoapp_token');
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);