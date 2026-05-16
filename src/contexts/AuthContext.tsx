import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import {
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
} from '@/lib/apiClient';
import type { AuthUser } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());
  const [isInitializing, setIsInitializing] = useState<boolean>(!!getAuthToken());
  const logoutRef = useRef<() => void>(() => undefined);

  const persistToken = useCallback((nextToken: string | null) => {
    setAuthToken(nextToken);
    setTokenState(nextToken);
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);
  logoutRef.current = logout;

  useEffect(() => {
    setUnauthorizedHandler(() => logoutRef.current());
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const existing = getAuthToken();
    if (!existing) {
      setIsInitializing(false);
      return;
    }
    let cancelled = false;
    authService
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logout]);

  const login = useCallback<AuthContextValue['login']>(
    async (input) => {
      const result = await authService.login(input);
      persistToken(result.token);
      setUser(result.user);
      return result.user;
    },
    [persistToken],
  );

  const register = useCallback<AuthContextValue['register']>(
    async (input) => {
      const result = await authService.register(input);
      persistToken(result.token);
      setUser(result.user);
      return result.user;
    },
    [persistToken],
  );

  const refresh = useCallback(async () => {
    if (!getAuthToken()) return;
    const me = await authService.me();
    setUser(me);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isInitializing,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, isInitializing, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
