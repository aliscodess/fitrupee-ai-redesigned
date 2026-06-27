import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('fitrupee-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch { /* ignore */ }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - auto token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const stored = localStorage.getItem('fitrupee-auth');
        if (stored) {
          const { state } = JSON.parse(stored);
          if (state?.refreshToken) {
            const { data } = await api.post('/auth/refresh', { refreshToken: state.refreshToken });
            const { accessToken, refreshToken } = data.data;
            const { useAuthStore } = await import('../store/authStore');
            useAuthStore.getState().setTokens(accessToken, refreshToken);
            original.headers.Authorization = `Bearer ${accessToken}`;
            return api(original);
          }
        }
      } catch { /* force logout */ }
    }
    return Promise.reject(error);
  }
);

export default api;
