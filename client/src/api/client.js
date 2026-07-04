import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// We use import.meta.env.VITE_API_URL for production (Vercel)
// and fallback to localhost:5000/api for your local development.
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' 
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
};

export const booksAPI = {
  list: () => api.get('/books'),
  get: (id) => api.get(`/books/${id}`),
  upload: (formData) => api.post('/books/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/books/${id}`),
  rebuild: (id) => api.post(`/books/${id}/rebuild`),
};

export const searchAPI = {
  text: (data) => api.post('/search/text', data),
  ocr: (formData) => api.post('/search/ocr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  history: (params) => api.get('/search/history', { params }),
  bookmarks: () => api.get('/search/bookmarks'),
  createBookmark: (data) => api.post('/search/bookmarks', data),
  deleteBookmark: (id) => api.delete(`/search/bookmarks/${id}`),
  analytics: (bookId) => api.get(`/search/analytics/${bookId}`),
  metrics: (bookId) => api.get(`/search/metrics/${bookId}`),
  recommendations: () => api.get('/search/recommendations'),
};

export default api;
