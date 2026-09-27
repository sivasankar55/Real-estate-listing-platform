"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string; phone: string | null };
type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};
type Session = { accessToken: string; user: User };
const AuthContext = createContext<AuthContextValue | null>(null);
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error?.message ?? "Something went wrong.");
  return body;
}

let refreshInFlight: Promise<Session> | null = null;

function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = request("/api/auth/refresh", { method: "POST" }).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSession()
      .then((session) => {
        setUser(session.user);
        setAccessToken(session.accessToken);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      signIn: async (email, password) => {
        const session = await request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setUser(session.user);
        setAccessToken(session.accessToken);
      },
      signUp: async (name, email, password, phone) => {
        const session = await request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name,
            email,
            password,
            phone: phone || undefined,
          }),
        });
        setUser(session.user);
        setAccessToken(session.accessToken);
      },
      signOut: async () => {
        await request("/api/auth/logout", { method: "POST" });
        setUser(null);
        setAccessToken(null);
      },
    }),
    [user, accessToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
