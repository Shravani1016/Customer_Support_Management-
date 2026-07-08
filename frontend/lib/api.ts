import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token =
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let refreshQueue: (() => void)[] = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

if (!refreshToken) {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");

  window.location.href = "/login";
  return Promise.reject(error);
} 

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post('http://localhost:8000/api/auth/refresh', {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', res.data.access_token);
localStorage.setItem('refresh_token', res.data.refresh_token);

// Update default Authorization header
api.defaults.headers.common['Authorization'] =
  `Bearer ${res.data.access_token}`;

// Update the current request header
originalRequest.headers.Authorization =
  `Bearer ${res.data.access_token}`;

refreshQueue.forEach((cb) => cb());
refreshQueue = [];

return api(originalRequest);
      } catch (refreshError) {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");

  window.location.href = "/login";
  return Promise.reject(refreshError);
}       finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;