"use client";

/**
 * Sign-in — wired to POST /api/v1/auth/login/.
 *
 * Accepts email OR 11-digit phone number as the identifier (per the API
 * login view). On success the session store is authoritative (tokens in
 * memory + refresh persisted) and we redirect to the authenticated
 * landing. Redirect targets are never taken from query params in this
 * unit — no open-redirect surface (Phase 3).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api/client";
import { roleHome } from "@/lib/auth/guards";
import { GuestPage } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/provider";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormError } from "@/components/auth/FormError";
import { InputField } from "@/components/auth/InputField";

export default function SignInPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{
    message: string;
    errors?: Record<string, string[]> | string[];
  } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // guard: no double submit
    setError(null);

    const id = identifier.trim();
    if (!id || !password) {
      setError({ message: "Email/phone and password are required." });
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(id, password);
      router.replace(roleHome(user.user_type));
    } catch (err) {
      // Phase 2 — ApiError.message is server-authored safe copy; anything
      // unexpected becomes a generic message, never raw error text.
      setError({
        message:
          err instanceof ApiError ? err.message : "Unable to sign in. Please try again.",
        errors: err instanceof ApiError ? (err.fieldErrors ?? undefined) : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GuestPage>
      <AuthLayout title="Sign in">
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <InputField
            label="Email or phone"
            name="identifier"
            value={identifier}
            onChange={setIdentifier}
            placeholder="email@example.com or 08012345678"
            type="text"
            autoComplete="username"
            required
            hint="Your account works with either your email or your 11-digit phone number."
          />

          <InputField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            type="password"
            autoComplete="current-password"
            required
          />

          <FormError message={error?.message} errors={error?.errors} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-green-500 bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-500 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="pt-2 text-center text-sm text-black/45 dark:text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-green-600 underline underline-offset-2 dark:text-green-400"
            >
              Sign up
            </Link>
          </p>
        </form>
      </AuthLayout>
    </GuestPage>
  );
}