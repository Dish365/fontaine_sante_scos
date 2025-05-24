import axios from 'axios';

// API Configuration
const API_CONFIG = {
  DJANGO_API_URL: process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api',
  FASTAPI_API_URL: process.env.NEXT_PUBLIC_FASTAPI_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
};

// Create axios instances
const djangoApi = axios.create({
  baseURL: API_CONFIG.DJANGO_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fastapiApi = axios.create({
  baseURL: API_CONFIG.FASTAPI_API_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
const addAuthHeader = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

djangoApi.interceptors.request.use(addAuthHeader);
fastapiApi.interceptors.request.use(addAuthHeader);

// Add response interceptor for error handling
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

djangoApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

fastapiApi.interceptors.response.use(
  (response) => response,
  handleResponseError
);

// API endpoints
export const api = {
  // Django endpoints
  django: {
    auth: {
      login: (credentials: any) => djangoApi.post('/auth/login/', credentials),
      register: (userData: any) => djangoApi.post('/auth/register/', userData),
      logout: () => djangoApi.post('/auth/logout/'),
    },
    user: {
      profile: () => djangoApi.get('/users/profile/'),
      updateProfile: (data: any) => djangoApi.put('/users/profile/', data),
    },
  },
  
  // FastAPI endpoints
  fastapi: {
    economic: {
      calculate: (data: any) => fastapiApi.post('/economic/calculate', data),
      optimize: (data: any) => fastapiApi.post('/economic/optimize', data),
    },
    environmental: {
      assess: (data: any) => fastapiApi.post('/environmental/assess', data),
    },
    quality: {
      evaluate: (data: any) => fastapiApi.post('/quality/evaluate', data),
    },
    tradeoff: {
      analyze: (data: any) => fastapiApi.post('/tradeoff/analyze', data),
    },
  },
};

export default api; 