
import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// Ensure the base URL ends with exactly one /api.
const normalizedBaseURL = API_BASE_URL.replace(/\/api\/?$/, "") + "/api";

console.log("CRM API base URL:", normalizedBaseURL);

const api = axios.create({
  baseURL: normalizedBaseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Prevent duplicate /api prefixes in request paths.
api.interceptors.request.use((config) => {
  if (config.url) {
    config.url = config.url
      .replace(/^\/+/, "")
      .replace(/^api\/+/i, "");
    config.url = `/${config.url}`;
  }

  return config;
});

// Do not redirect to login for public authentication endpoints.
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

      const normalizedUrl = `/${requestUrl
        .replace(/^\/+/, "")
        .replace(/^api\/+/i, "")}`;

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
