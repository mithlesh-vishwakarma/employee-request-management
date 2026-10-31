import axios from 'axios';

const resolveBaseUrl = () => {
  // Support both VITE_API_BASE_URL and API_BASE_URL
  const rawUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '';

  let url = (typeof rawUrl === 'string' ? rawUrl : '').trim();

  // If no env var provided, fallback to localhost for development
  if (!url) {
    return 'http://localhost:5000/api/v1';
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Automatically ensure /api/v1 prefix is appended if user gave root domain
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(customError);
  }
);

export default api;

