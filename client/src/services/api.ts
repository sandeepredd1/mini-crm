
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

// Prevent duplicate /api when page files use "/api/customers"
// instead of "/customers".
api.interceptors.request.use((config) => {
  const url = config.url ?? "";

  if (/^\/api(?:\/|$)/.test(url)) {
    config.url = url.replace(/^\/api(?=\/|$)/, "") || "/";
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
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !publicAuthEndpoints.has(
        (error.config?.url ?? "").replace(/^\/api(?=\/|$)/, "")
      ) &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
