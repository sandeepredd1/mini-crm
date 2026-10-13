
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Redirect to login when a protected API request returns 401.
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
      const requestUrl = (error.config?.url ?? "").split("?")[0];
      const normalizedUrl = `/${requestUrl.replace(/^\/+/, "")}`;

      if (
        error.response?.status === 401 &&
        !publicAuthEndpoints.has(normalizedUrl) &&
        window.location.pathname !== "/login"
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
