"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch {
        logout();
        return;
      }
    }

    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data);

        if (localStorage.getItem("access_token")) {
          localStorage.setItem("user", JSON.stringify(res.data));
        } else {
          sessionStorage.setItem("user", JSON.stringify(res.data));
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/api/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("access_token", response.data.access_token);
    storage.setItem("refresh_token", response.data.refresh_token);

    if (response.data.user) {
      storage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
    } else {
      const me = await api.get("/api/auth/me");
      storage.setItem("user", JSON.stringify(me.data));
      setUser(me.data);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");

    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);