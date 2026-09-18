"use client";

import { AppleIcon, GoogleIcon } from "./icons";

export function SocialButtons() {
  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <button
          type="button"
          className="flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <GoogleIcon />
          <span className="whitespace-nowrap">Sign up with Google</span>
        </button>
        <button
          type="button"
          className="flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-black/[0.02] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <AppleIcon />
          <span className="whitespace-nowrap">Sign up with Apple</span>
        </button>
      </div>

      <div className="my-6 flex items-center gap-4 text-xs font-medium text-black/40 dark:text-white/30">
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        or
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>
    </>
  );
}