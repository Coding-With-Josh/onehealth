/**
 * Shared data-fetching hook for auth-aware resources.
 *
 * Contract (Phase 2, fail-closed):
 *  - renders either full data or a safe error state — never partial data;
 *  - never auto-retries (apiFetch does ONE refresh + retry on a 401, then
 *    throws);
 *  - `error` is a controlled generic copy for the UI; raw ApiError detail
 *    goes to the console only, never the DOM.
 *
 * Security note (complete mediation): this hook is role-agnostic — a page
 * decides WHICH path to fetch. The API enforces authorization per endpoint
 * (IsPatient / IsHospitalStaff+grant). The client never skips an auth
 * check by choosing a path; it only renders what the API already granted.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";

export interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  /** Controlled generic copy. Raw error is console-only. */
  error: string | null;
  reload: () => void;
}

const GENERIC_LOAD_ERROR =
  "Couldn't load this right now. Check your connection and try again.";

/**
 * @param path API path (bare — /api/v1 is added by rawRequest).
 * @param logPrefix Console label for this resource (e.g. "[patient]").
 */
export function useResource<T>(path: string, logPrefix = "[api]"): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch<T>(path)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        console.error(`${logPrefix} ${path} failed`, e);
        // Fail closed: drop any stale data and show the safe copy.
        setData(null);
        setError(GENERIC_LOAD_ERROR);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, tick, logPrefix]);

  return {
    data,
    loading,
    error,
    reload: useCallback(() => setTick((t) => t + 1), []),
  };
}