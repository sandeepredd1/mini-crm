
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Prevent duplicate /api when a request accidentally includes it.
  if (config.url) {
    config.url = config.url.replace(/^\/api(?=\/|$)/, "");
  }

  return config;
});

const publicAuthEndpoints = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/me",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const requestUrl = (error.config?.url ?? "").replace(
        /^\/api(?=\/|$)/,
        ""
      );

      if (
        error.response?.status === 401 &&
        !publicAuthEndpoints.has(requestUrl) &&
        window.location.pathname !== "/login"
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
