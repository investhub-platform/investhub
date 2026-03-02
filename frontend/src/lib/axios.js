import axios from "axios";

const api = axios.create({
  baseURL: "/api",
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

    if (!original) return Promise.reject(err);

    const status = err?.response?.status;
    const url = original?.url || "";

    // ✅ Don't refresh for auth endpoints (login/register/refresh/logout/forgot/reset/verify)
    const isAuthRoute =
      url.includes("/v1/auth/login") ||
      url.includes("/v1/auth/register") ||
      url.includes("/v1/auth/refresh") ||
      url.includes("/v1/auth/logout") ||
      url.includes("/v1/auth/forgot-password") ||
      url.includes("/v1/auth/reset-password") ||
      url.includes("/v1/auth/verify-email") ||
      url.includes("/v1/auth/resend");

    if (status !== 401 || original._retry || isAuthRoute) {
      return Promise.reject(err);
    }

    // ✅ Only refresh if the request actually had a bearer token
    const hadBearer = !!original.headers?.Authorization;
    if (!hadBearer) return Promise.reject(err);

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pending.push({
          resolve: (token) => {
            original.headers = original.headers || {};
            if (token) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // ✅ Use raw axios here to avoid interceptor recursion
      const r = await axios.post("/api/v1/auth/refresh", {}, { withCredentials: true });

      const newToken = r?.data?.data?.accessToken;
      if (!newToken) throw new Error("Refresh did not return token");

      setAuthToken(newToken);
      localStorage.setItem("accessToken", newToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;

      flushPending(null, newToken);
      return api(original);
    } catch (e) {
      flushPending(e, null);

      // optional: force clean local token if refresh fails
      localStorage.removeItem("accessToken");
      setAuthToken("");

      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;