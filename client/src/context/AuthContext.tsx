import {
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";
import api from "../services/api";
import { AuthContext } from "./auth-state";
import type { AuthContextType, User } from "./auth-state";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get("/api/auth/me");

      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setUser(null);
          return;
        }
      }

      throw error;
    }
  };

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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