"use client";

/**
 * Authenticated landing — the place every role reaches after sign-in
 * until role-specific dashboards land (next unit). Proves the session
 * works end-to-end (tokens, refresh, guards) and shows what's next.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProtectedPage } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/provider";

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  hospital_staff: "Hospital staff",
  platform_admin: "Platform admin",
};

const COMING_SOON: Record<string, string[]> = {
  patient: ["Dashboard", "Medical records", "Patient card", "Visits", "Access requests"],
  hospital_staff: ["Hospital dashboard", "Card lookup", "Patient chart", "Active visits workspace"],
  platform_admin: ["Hospital verification queue", "Global audit log"],
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    router.replace("/sign-in");
  }

  return (
    <ProtectedPage>
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans text-black antialiased dark:bg-black dark:text-white">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h1 className="font-mix text-2xl font-semibold tracking-tight">You&apos;re signed in</h1>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-black/45 dark:text-white/40">Account</dt>
              <dd className="truncate font-medium">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-black/45 dark:text-white/40">Role</dt>
              <dd className="font-medium">
                {user ? (ROLE_LABELS[user.user_type] ?? user.user_type) : "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-6 text-sm text-black/45 dark:text-white/40">
            Your session works — tokens, silent refresh, and route guards are live.
            Your portal pages ship next:
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {(COMING_SOON[user?.user_type ?? ""] ?? []).map((item) => (
              <li key={item} className="flex items-center gap-2 text-black/60 dark:text-white/60">
                <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2">
            <Link
              href="/"
              className="flex h-11 items-center justify-center rounded-2xl border border-black/10 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Back to home
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex h-11 items-center justify-center rounded-2xl border border-black/10 text-sm font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/5"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}