/**
 * Auth session store — the single source of truth for "who is signed in".
 *
 * Design (Phase 1 B3/B4):
 *   - ACCESS token lives in module memory ONLY. It is never written to
 *     localStorage, which shrinks the XSS theft window to the current tab.
 *   - REFRESH token + a user snapshot is mirrored to localStorage
 *     (`onehealth:session`) under try/catch — if storage is unavailable
 *     (privacy mode) the session keeps working in memory until reload.
 *   - A GENERATION counter is bumped on every clear/logout. Any async
 *     result captured before the bump is discarded, so a refresh that
 *     resolves after logout cannot resurrect the session (Phase 3,
 *     concurrency table, row 2).
 *
 * Fail-closed rules (Phase 2):
 *   - Refresh failure of any kind (network, blacklist, expiry) => session
 *     wiped. We never serve data on an identity we cannot re-verify.
 *   - Login only transitions to `authenticated` when the server returns
 *     BOTH tokens. Any other outcome leaves the state untouched.
 *   - Logout ALWAYS clears local state even if the API call fails.
 */
"use client";

import { rawRequest, ApiError } from "@/lib/api/client";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type UserType = "patient" | "hospital_staff" | "platform_admin";

export interface AuthUser {
  id: string;
  email: string;
  user_type: UserType;
  must_change_password: boolean;
  profile?: Record<string, unknown> | null;
}

export type SessionState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser; profile?: Record<string, unknown> | null };

const USER_TYPES: UserType[] = ["patient", "hospital_staff", "platform_admin"];

/* ------------------------------------------------------------------ */
/* Module state                                                        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "onehealth:session";

interface PersistedSession {
  refresh: string;
  user: AuthUser;
}

let state: SessionState = { status: "loading" };
let accessToken: string | null = null; // memory-only by design (see header)
let refreshToken: string | null = null; // kept in memory, mirrored to storage
let generation = 0; // invalidates stale async results after clear/logout
let refreshPromise: Promise<boolean> | null = null; // single-flight (Phase 3)
let bootstrapped = false;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): SessionState {
  return state;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/* ------------------------------------------------------------------ */
/* Persistence (localStorage, best-effort)                             */
/* ------------------------------------------------------------------ */

function readPersisted(): PersistedSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (typeof parsed.refresh !== "string" || !parsed.user) return null;
    // Phase 3 — normalize user_type from storage; a tampered value that is
    // not a known type fails closed (never treated as a privileged role).
    parsed.user = {
      ...parsed.user,
      user_type: USER_TYPES.includes(parsed.user.user_type)
        ? parsed.user.user_type
        : "patient",
    };
    return parsed;
  } catch {
    return null;
  }
}

function writePersisted(session: PersistedSession) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — in-memory session continues; nothing to do.
  }
}

function clearPersisted() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — memory state is cleared regardless (fail-closed).
  }
}

/* ------------------------------------------------------------------ */
/* Core transitions                                                    */
/* ------------------------------------------------------------------ */

function resetSession() {
  generation += 1;
  accessToken = null;
  refreshToken = null;
  clearPersisted();
  if (state.status !== "unauthenticated") {
    state = { status: "unauthenticated" };
    notify();
  }
}

function applyAuthenticated(user: AuthUser, access: string, refresh: string, profile?: Record<string, unknown> | null) {
  accessToken = access;
  refreshToken = refresh;
  writePersisted({ refresh, user });
  state = { status: "authenticated", user, profile: profile ?? user.profile ?? null };
  notify();
}

/** Normalize the raw `user` object from the login response. */
function normalizeUser(raw: unknown): AuthUser {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    id: String(record.id ?? ""),
    email: String(record.email ?? "user"),
    // Phase 3 — never widen a role from an untrusted payload.
    user_type: USER_TYPES.includes(record.user_type as UserType)
      ? (record.user_type as UserType)
      : "patient",
    must_change_password: record.must_change_password === true,
    profile: (record.profile as Record<string, unknown> | undefined) ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function login(identifier: string, password: string): Promise<AuthUser> {
  const envelope = await rawRequest<{
    user?: unknown;
    tokens?: { access?: unknown; refresh?: unknown };
  }>("/auth/login/", {
    method: "POST",
    body: { identifier, password },
  });

  const access = envelope.data?.tokens?.access;
  const refresh = envelope.data?.tokens?.refresh;
  const rawUser = envelope.data?.user;

  // Phase 2 — fail-closed: both tokens AND a user payload must be present
  // before we consider this a successful login.
  if (typeof access !== "string" || typeof refresh !== "string" || !rawUser) {
    throw new ApiError({
      status: 0,
      code: "AUTHENTICATION_FAILED",
      message: "Sign-in succeeded but the server response was incomplete. Please try again.",
    });
  }

  const user = normalizeUser(rawUser);
  applyAuthenticated(user, access, refresh);
  return user;
}

/**
 * Refresh the access token. Single-flight: concurrent callers share one
 * in-flight request (Phase 3, concurrency row 1). On ANY failure the
 * session is wiped (fail-closed).
 */
export function refreshTokens(): Promise<boolean> {
  const snapshotGeneration = generation;
  const payload = refreshToken ?? readPersisted()?.refresh ?? null;

  if (!payload) {
    if (state.status === "authenticated") resetSession();
    return Promise.resolve(false);
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const envelope = await rawRequest<{ access?: unknown; refresh?: unknown }>(
          "/auth/login/refresh/",
          { method: "POST", body: { refresh: payload } },
        );
        const access = envelope.data?.access;
        const nextRefresh = envelope.data?.refresh;

        // Phase 3 row 2 — discard the result if the session was cleared
        // (logout) while this request was in flight.
        if (generation !== snapshotGeneration) return false;
        if (typeof access !== "string" || typeof nextRefresh !== "string") return false;

        accessToken = access;
        refreshToken = nextRefresh;
        const current = state.status === "authenticated" ? state.user : readPersisted()?.user;
        if (current) {
          writePersisted({ refresh: nextRefresh, user: current });
        }
        return true;
      } catch {
        // Phase 2 — refresh failure wipes the session. This is the
        // deliberate fail-closed degrade: no data on unverifiable identity.
        resetSession();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

/** Restore a session on app boot, if one was persisted. */
export async function bootstrap(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;

  if (refreshToken === null) {
    const persisted = readPersisted();
    if (!persisted) {
      if (state.status === "loading") {
        state = { status: "unauthenticated" };
        notify();
      }
      return;
    }
    refreshToken = persisted.refresh;
  }

  const ok = await refreshTokens();
  if (!ok) return; // refreshTokens already reset the session

  const user = state.status === "authenticated" ? state.user : readPersisted()?.user;
  if (!user) {
    resetSession();
    return;
  }

  // Fetch the profile for display; a failure here is NOT fatal — the
  // stored user snapshot already tells us the role for routing.
  let profile: Record<string, unknown> | null = null;
  try {
    const me = await rawRequest<Record<string, unknown>>("/auth/me/", {
      token: accessToken,
    });
    profile = (me.data as Record<string, unknown> | undefined) ?? null;
  } catch {
    profile = null;
  }

  if (state.status === "authenticated" && state.user.id === user.id) {
    state = { status: "authenticated", user, profile };
    notify();
  } else {
    resetSession();
  }
}

/** Log out. Always clears local state; API blacklist is best-effort. */
export async function logout(): Promise<void> {
  const refresh = refreshToken ?? readPersisted()?.refresh ?? null;

  // Best-effort blacklist of the refresh token (Phase 2 — outage tolerated).
  if (refresh) {
    try {
      await rawRequest("/auth/logout/", {
        method: "POST",
        body: { refresh },
        token: accessToken,
      });
    } catch {
      // Ignore: local clear below is authoritative.
    }
  }

  // Idempotent: resetSession bumps the generation counter and clears
  // tokens + persisted storage, so a concurrent in-flight refresh that
  // resolves after this point cannot resurrect the session (Phase 3).
  resetSession();
}