import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refresh');
        if (!refreshToken) throw new Error('No refresh token');
        
        // Use a plain axios instance to avoid interceptor loop
        const res = await axios.post(`${api.defaults.baseURL}/auth/token/refresh/`, { refresh: refreshToken });
        
        Cookies.set('access', res.data.access);
        if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        }
        return api(originalRequest);
      } catch (err) {
        Cookies.remove('access');
        Cookies.remove('refresh');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
