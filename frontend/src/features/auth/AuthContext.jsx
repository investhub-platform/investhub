import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // Attach token to axios whenever it changes
  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  // Bootstrap session on app load:
  // tries refresh -> if ok, fetch /users/me
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const r = await api.post("/v1/auth/refresh");
        const token = r?.data?.data?.accessToken;
        if (!token) throw new Error("No token from refresh");
        setAccessToken(token);

        const me = await api.get("/v1/users/me");
        setUser(me?.data?.data ?? null);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, []);

  // Login
  const login = async ({ email, password }) => {
    const r = await api.post("/v1/auth/login", { email, password });
    const token = r?.data?.data?.accessToken;
    const u = r?.data?.data?.user;
    setAccessToken(token);
    setUser(u);
    return u;
  };

  // Logout (clears refresh cookie server-side + local state)
  const logout = async () => {
    try {
      await api.post("/v1/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      booting,
      accessToken,
      user,
      isAuthed: Boolean(accessToken),
      isAdmin: Boolean(user?.roles?.includes("admin")),
      setUser,
      login,
      logout,
      setAccessToken,
    }),
    [booting, accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};