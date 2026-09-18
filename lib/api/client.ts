/**
 * Low-level HTTP client for the OneHealth API.
 *
 * This module is deliberately dumb: it performs a SINGLE request, attaches
 * an optional bearer token, and normalizes the response into a typed
 * envelope or throws an `ApiError`. All refresh/retry/auth orchestration
 * lives ABOVE this (lib/auth/session.ts, lib/api/index.ts) so there is
 * exactly one place that knows about token rotation.
 *
 * Envelope shapes accepted (the API is not 100% consistent yet):
 *   - success via `core.responses.success_response`: { success, message, data }
 *   - error via `core.exceptions.custom_exception_handler`: { success, code, message, errors }
 *   - a few legacy bare Responses use `status` instead of `success`
 *     (e.g. the refresh endpoint); both keys are normalized below
 *   - raw DRF errors { detail: ... } are folded into ApiError
 *
 * Security invariants (Phase 2/3):
 *   - Errors that reach callers are ALWAYS safe-to-display strings.
 *     Raw fetch errors (which can embed URLs/fragments) are replaced with
 *     a fixed copy; HTML error pages are never passed through.
 */

export interface ApiEnvelope<T = unknown> {
  success?: boolean;
  status?: boolean;
  message?: string;
  code?: string;
  errors?: Record<string, string[]> | string[];
  data?: T;
  detail?: unknown;
}

export interface ApiErrorOptions {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]> | null;
}

/** Normalized API failure. `message` is always safe to render to a user. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]> | null;

  constructor({ status, code, message, fieldErrors = null }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Bearer token to attach. Undefined = anonymous request (login, refresh). */
  token?: string | null;
  signal?: AbortSignal;
}

function safeErrorMessage(status: number): string {
  // Fixed, non-leaking copy — never `err.message` from a failed fetch.
  if (status > 0) {
    return "The server returned an error. Please try again.";
  }
  return "Cannot reach the server. Check your connection and try again.";
}

function normalizeDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message: unknown }).message);
    }
  }
  if (detail && typeof detail === "object" && "detail" in detail) {
    return normalizeDetail((detail as { detail: unknown }).detail);
  }
  return "";
}

const DEFAULT_TIMEOUT_MS = 15_000;

/** Never let a request hang the session forever (Phase 2). Caller-supplied
 * signals win; otherwise a default abort protects loading states. */
function resolveSignal(signal?: AbortSignal): AbortSignal | undefined {
  if (signal) return signal;
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(DEFAULT_TIMEOUT_MS);
  }
  return undefined;
}

/** Single request. Never retries, never refreshes — see lib/api/index.ts. */
export async function rawRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, token = null, signal } = options;
  const url = `/api/v1${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal: resolveSignal(signal),
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        // Phase 1 B3 — every authenticated call carries the bearer token;
        // anonymous calls (login/refresh) deliberately omit Authorization.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Phase 2 — network failure: fail-closed, fixed copy, no raw fetch error.
    throw new ApiError({ status: 0, code: "NETWORK_ERROR", message: safeErrorMessage(0) });
  }

  // Non-JSON response (HTML error page, proxy 500) — never pass through.
  const text = await response.text();
  let parsed: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      parsed = null;
    }
  }

  if (parsed === null) {
    throw new ApiError({
      status: response.status,
      code: response.status >= 500 ? "SERVER_ERROR" : "PARSE_ERROR",
      message: safeErrorMessage(response.status),
    });
  }

  const ok = parsed.success === true || parsed.status === true || response.status < 400;
  if (ok) return parsed;

  const detailMessage = normalizeDetail(parsed.detail);
  throw new ApiError({
    status: response.status,
    code:
      parsed.code ??
      (response.status === 401 ? "NOT_AUTHENTICATED" : "ERROR"),
    message:
      parsed.message ||
      detailMessage ||
      (response.status === 401
        ? "Your session has expired. Please sign in again."
        : safeErrorMessage(response.status)),
    fieldErrors: validFieldErrors(parsed.errors) ?? null,
  });
}

function validFieldErrors(
  errors: Record<string, string[]> | string[] | undefined,
): Record<string, string[]> | null {
  if (!errors) return null;
  if (Array.isArray(errors)) {
    const strings = errors.filter((e): e is string => typeof e === "string");
    return strings.length > 0 ? { non_field_errors: strings } : null;
  }
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(errors)) {
    out[key] = (Array.isArray(value) ? value : [String(value)]).map(String);
  }
  return Object.keys(out).length > 0 ? out : null;
}