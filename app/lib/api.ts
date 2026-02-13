import axios from "axios";

const ALLOWED_REDIRECT_DOMAINS = ["https://app.abacatepay.com"];

function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("zencash_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("zencash_token");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      try {
        const rawApi = axios.create({
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          headers: { "Content-Type": "application/json" },
        });
        const token = localStorage.getItem("zencash_token");
        const { data } = await rawApi.post<{ url: string }>(
          "/api/payments/link",
          null,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (isAllowedRedirectUrl(data.url)) {
          window.location.href = data.url;
        } else {
          console.error("Blocked redirect to untrusted domain:", data.url);
          window.location.href = "/login";
        }
      } catch {
        window.location.href = "/login";
      }
      return new Promise(() => {});
    }

    return Promise.reject(error);
  },
);

export default api;
