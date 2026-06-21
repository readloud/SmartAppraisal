import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const masterApi = {
  getBrands: () => api.get('/master/brands'),
  getModels: (brandId) => api.get(`/master/models?brand_id=${brandId}`),
  getVariants: (modelId) => api.get(`/master/variants?model_id=${modelId}`),
  getColors: () => api.get('/master/colors'),
  getConditions: () => api.get('/master/conditions'),
  getAccessories: () => api.get('/master/accessories'),
};

export const appraisalApi = {
  create: (data) => api.post('/appraisal', data),
  get: (id) => api.get(`/appraisal/${id}`),
  update: (id, data) => api.put(`/appraisal/${id}`, data),
  updatePrice: (id, data) => api.put(`/appraisal/${id}/price`, data),
  getRecommendation: (id) => api.get(`/appraisal/${id}/recommendation`),
};

export const transactionApi = {
  get: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  getDetail: (id) => api.get(`/transactions/${id}`),
  updateStatus: (id, status) => api.put(`/transactions/${id}/status`, { status }),
};

export const dashboardApi = {
  getStats: (days) => api.get('/dashboard/stats', { params: { days } }),
  getPriceTrend: (params) => api.get('/dashboard/price-trend', { params }),
  getTopModels: (limit) => api.get('/dashboard/top-models', { params: { limit } }),
};

export const reportsApi = {
  export: (params) => api.get('/reports/export', { 
    params,
    responseType: 'blob' 
  }),
  profitAnalysis: (params) => api.get('/reports/profit-analysis', { params }),
  inventory: () => api.get('/reports/inventory'),
};

export default api;