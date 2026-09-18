"use client";

/**
 * Client-side route guards.
 *
 * SECURITY NOTE (Phase 1, complete mediation): these guards are UX only.
 * They never authorize data access — every piece of protected data still
 * goes through the API, which enforces its own per-role permission
 * classes. A user who disables the guard gets 401/403 from the backend,
 * not data. These guards exist to prevent confusing flashes of the wrong
 * page and to keep staff with an un-reset temp password out of pages they
 * cannot use.
 */
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth/provider";
import type { UserType } from "@/lib/auth/session";

/** Where each role lands after sign-in. Patient and hospital-staff portals
 * are live; platform admins land on the generic account page until their
 * console ships. */
export function roleHome(userType?: UserType | null): string {
  if (userType === "patient") return "/dashboard/";
  if (userType === "hospital_staff") return "/staff/";
  return "/account";
}

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex items-center gap-3 text-sm text-black/50 dark:text-white/50">
        <span className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-green-600 dark:border-white/20 dark:border-t-green-400" />
        Loading…
      </div>
    </div>
  );
}

interface ProtectedPageProps {
  /** Restrict to specific roles. Omit to allow any authenticated user. */
  userTypes?: UserType[];
  children: ReactNode;
}

export function ProtectedPage({ userTypes, children }: ProtectedPageProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !user) {
      router.replace("/sign-in");
      return;
    }
    // Phase 3 workflow-bypass guard: staff with an un-reset temporary
    // password must not reach any data page (the API would refuse anyway;
    // this keeps the UX from looking broken).
    if (user.must_change_password) {
      router.replace("/change-password");
      return;
    }
    if (userTypes && !userTypes.includes(user.user_type)) {
      // Authenticated but wrong portal → land on the account page instead
      // of flashing a forbidden page.
      router.replace(roleHome(user.user_type));
    }
  }, [status, user, userTypes, router]);

  const blocked =
    status === "loading" ||
    status !== "authenticated" ||
    !user ||
    user.must_change_password ||
    (userTypes ? !userTypes.includes(user.user_type) : false);

  if (blocked) return <AuthLoadingScreen />; // redirect is in flight
  return <>{children}</>;
}

/** Wraps sign-in / sign-up: bounce already-authenticated users away. */
export function GuestPage({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && user) {
      router.replace(user.must_change_password ? "/change-password" : roleHome(user.user_type));
    }
  }, [status, user, router]);

  if (status === "loading" || status === "authenticated") {
    return <AuthLoadingScreen />;
  }
  return <>{children}</>;
}