"use client";

/**
 * Temporary-password gate (staff accounts created by a hospital admin).
 *
 * The API sets `must_change_password=true` on such accounts and blocks
 * every endpoint except password change — but the change-password
 * endpoint does not exist in the API yet (flagged gap), so this page is
 * an honest holding state: it explains the requirement and provides a
 * way out (sign out) so the user is never trapped in a redirect loop.
 * Wiring to a real change endpoint lands with the API gap fix.
 */
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthLoadingScreen } from "@/lib/auth/guards";
import { useAuth } from "@/lib/auth/provider";

export default function ChangePasswordPage() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }
    // Already reset — no reason to be here.
    if (status === "authenticated" && user && !user.must_change_password) {
      router.replace("/account");
    }
  }, [status, user, router]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await logout();
    router.replace("/sign-in");
  }

  if (status === "loading") return <AuthLoadingScreen />;
  if (status !== "authenticated" || !user || !user.must_change_password) {
    return <AuthLoadingScreen />; // redirect in flight
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans text-black antialiased dark:bg-black dark:text-white">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
        <h1 className="font-mix text-2xl font-semibold tracking-tight">Password change required</h1>
        <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">
          Your hospital administrator created this account with a temporary password.
          Until it is changed, your account can&apos;t access any records — the API
          enforces this server-side, not just in the UI.
        </p>
        <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">
          The password-change endpoint is on the API work list. In the meantime you can
          sign out and contact your hospital administrator.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-8 flex h-11 w-full items-center justify-center rounded-2xl border border-black/10 text-sm font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/5"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </main>
  );
}