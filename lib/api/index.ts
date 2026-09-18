/**
 * Auth-aware API helper for feature code.
 *
 * This is the ONLY entry point feature pages use to talk to the API.
 * It guarantees (Phase 1 B3, complete mediation):
 *   - every authenticated call carries the current access token,
 *   - a single 401 triggers ONE refresh (single-flight inside session.ts)
 *     and one retry of the original request,
 *   - if the refresh fails, the original ApiError propagates and the
 *     session is already wiped — the caller sees a safe message and the
 *     guards redirect to sign-in.
 */
"use client";

import { rawRequest, ApiError, type RequestOptions } from "@/lib/api/client";
import { getAccessToken, refreshTokens } from "@/lib/auth/session";

export interface ApiFetchOptions extends Omit<RequestOptions, "token"> {
  /** Attach the bearer token. Default true. Set false for public calls. */
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T | null> {
  const auth = options.auth !== false;

  async function attempt(): Promise<T | null> {
    const envelope = await rawRequest<T>(path, {
      ...options,
      token: auth ? getAccessToken() : null,
    });
    return (envelope.data ?? null) as T | null;
  }

  try {
    return await attempt();
  } catch (error) {
    // Phase 2 — one retry after refresh on 401 ONLY for authenticated calls.
    // Anonymous calls (login/register/refresh) never auto-retry.
    if (!auth || !(error instanceof ApiError) || error.status !== 401) throw error;

    const refreshed = await refreshTokens();
    if (!refreshed) throw error; // session already wiped; original error is safe copy

    return await attempt();
  }
}