import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zencash_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zencash_token');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      try {
        const rawApi = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          headers: { 'Content-Type': 'application/json' },
        });
        const token = localStorage.getItem('zencash_token');
        const { data } = await rawApi.post<{ url: string }>('/api/payments/link', null, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        window.location.href = data.url;
      } catch {
        window.location.href = '/login';
      }
      return new Promise(() => {});
    }

    return Promise.reject(error);
  },
);

export default api;
