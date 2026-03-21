import { useCallback, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../../lib/axios";
import { AuthContext } from "./authCreate";
export { AuthContext };

export function AuthProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);

  const [accessToken, setAccessTokenState] = useState(
    () => localStorage.getItem("accessToken") || ""
  );

  const setAccessToken = useCallback((token) => {
    const t = token || "";
    setAccessTokenState(t);
    setAuthToken(t);

    if (t) localStorage.setItem("accessToken", t);
    else localStorage.removeItem("accessToken");
  }, []);

  const fetchMe = useCallback(async () => {
    const res = await api.get("/v1/users/me");
    const me = res.data?.data || null;
    setUser(me);
    return me;
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await api.post("/v1/auth/login", { email, password });
      const token = res.data?.data?.accessToken;
      if (!token) throw new Error("Login did not return access token");

      setAccessToken(token);
      await fetchMe();
    },
    [fetchMe, setAccessToken]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/v1/auth/logout");
    } catch {
      // ignore logout errors
    }
    setAccessToken("");
    setUser(null);
  }, [setAccessToken]);

  useEffect(() => {
    const start = async () => {
      try {
        if (!accessToken) return;
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
  }, [accessToken, fetchMe, setAccessToken]);

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
    [booting, isAuthed, user, accessToken, login, logout, fetchMe, setAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}