import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

let isRefreshing = false;
let pending = [];

const flushPending = (error, token = null) => {
  pending.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pending = [];
};

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // If not an auth error or already retried, just throw
    if (err?.response?.status !== 401 || original?._retry) {
      return Promise.reject(err);
    }

    original._retry = true;

    // Queue requests while refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push({
          resolve: (token) => {
            if (token) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const r = await api.post("/v1/auth/refresh");
      const newToken = r?.data?.data?.accessToken;

      if (!newToken) throw new Error("Refresh did not return token");

      setAuthToken(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;

      flushPending(null, newToken);
      return api(original);
    } catch (e) {
      flushPending(e, null);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;