import axios from "axios";

// Use VITE_API_BASE from environment
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api/v1",
  withCredentials: true
});

// Attach token automatically (if you use JWT)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;