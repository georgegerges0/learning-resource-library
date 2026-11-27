import axios from 'axios';

const STORAGE_KEY = 'kadidjiny_auth_user';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch (_) {
      // Ignore malformed storage entries
    }
  }
  return config;
});

export { STORAGE_KEY };
export default axiosInstance;
