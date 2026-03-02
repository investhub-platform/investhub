import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);

  // access token stored locally for page refreshes
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem("accessToken") || "");

  const setAccessToken = (token) => {
    const t = token || "";
    setAccessTokenState(t);
    setAuthToken(t);
    if (t) localStorage.setItem("accessToken", t);
    else localStorage.removeItem("accessToken");
  };

  const fetchMe = async () => {
    const res = await api.get("/v1/users/me");
    const me = res.data?.data || null;
    setUser(me);
    return me;
  };

  const login = async ({ email, password }) => {
    const res = await api.post("/v1/auth/login", { email, password });
    const token = res.data?.data?.accessToken;
    if (!token) throw new Error("Login did not return access token");
    setAccessToken(token);
    await fetchMe();
  };

  const logout = async () => {
    try {
      await api.post("/v1/auth/logout");
    } catch (e) {
      // ignore logout errors
    }
    setAccessToken("");
    setUser(null);
  };

  // Boot session:
  // 1) If   have an access token, try /me
  // 2) If /me fails with 401, axios interceptor will try refresh and retry automatically
  useEffect(() => {
    const start = async () => {
    try {
      if (!accessToken) return;        // ✅ don't call /me without token
      setAuthToken(accessToken);
      await fetchMe();
    } catch {
      setAccessToken("");
      setUser(null);
    } finally {
      setBooting(false);
    }
  };
  start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthed = !!user;

  const value = useMemo(
    () => ({
      booting,
      isAuthed,
      user,
      accessToken,
      login,
      logout,
      fetchMe,
      setUser,
      setAccessToken,
    }),
    [booting, isAuthed, user, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}