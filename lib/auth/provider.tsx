"use client";

/**
 * React binding for the session store (lib/auth/session.ts).
 *
 * The store holds the canonical state; this provider mirrors it into
 * React context so components re-render on login/logout/refresh. The
 * provider is mounted once in the root layout.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as session from "@/lib/auth/session";
import type { AuthUser, SessionState } from "@/lib/auth/session";

export type AuthContextValue = SessionState & {
  user: AuthUser | null;
  /** PatientProfile (or null for staff); populated by session bootstrap. */
  profile: Record<string, unknown> | null;
  login: (identifier: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => session.getState());

  useEffect(() => {
    // Subscribe FIRST, then bootstrap. bootstrap() can transition
    // loading → unauthenticated fully synchronously (no stored session);
    // if we bootstrapped before subscribing, that notification would be
    // missed and the provider would sit on "loading" forever.
    const unsubscribe = session.subscribe(() => setState(session.getState()));
    void session.bootstrap();
    return unsubscribe;
  }, []);

  const login = useCallback((identifier: string, password: string) => {
    return session.login(identifier, password);
  }, []);

  const logout = useCallback(() => {
    return session.logout();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    if (state.status === "authenticated") {
      return {
        status: "authenticated",
        user: state.user,
        profile: state.profile ?? null,
        login,
        logout,
      };
    }
    return {
      status: state.status,
      user: null,
      profile: null,
      login,
      logout,
    };
  }, [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}