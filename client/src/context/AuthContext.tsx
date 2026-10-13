
import {
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";

import api from "../services/api";
import { AuthContext } from "./auth-state";
import type {
  AuthContextType,
  User,
} from "./auth-state";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the currently logged-in user
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setUser(null);
        return;
      }

      throw error;
    }
  };

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(response.data.user);
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout", {});
    } finally {
      setUser(null);
    }
  };

  // Initialize authentication when the app loads
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error(
          "Failed to initialize authentication:",
          error
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
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
