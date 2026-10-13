
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { User, AuthContextType } from "./auth-state";

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user ?? null);
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      setUser(response.data.user);
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const response = await api.get("/auth/me");

        if (active) {
          setUser(response.data.user ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
