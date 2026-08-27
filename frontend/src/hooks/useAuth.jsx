import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authService from "../services/authService";

/* ============================================================
   Auth Context — refactor từ hooks/useAuth.js (hook trần).
   Trạng thái đăng nhập là SINGLE SOURCE OF TRUTH: mọi component
   consume cùng 1 context thay vì tự gọi service.
   Phiên khôi phục qua GET /auth/me (cookie httpOnly).
   ============================================================ */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên khi mở app
  useEffect(() => {
    let mounted = true;
    authService.restoreSession().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password) => {
    const u = await authService.register(email, password);
    setUser(u);
    return u;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const u = await authService.loginWithGoogle(idToken);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser: setUser,
    }),
    [user, loading, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return ctx;
}
