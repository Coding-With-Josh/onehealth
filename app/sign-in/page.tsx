"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InputField } from "@/components/auth/InputField";

export default function SignInPage() {
  return (
    <AuthLayout title="Sign in">
      <form className="mt-8 space-y-4">
        <InputField
          label="Email"
          value=""
          placeholder="email@example.com"
          type="email"
        />

        <InputField
          label="Password"
          value=""
          placeholder="Enter password"
          type="password"
        />

        <button
          type="button"
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-green-500 bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:border-green-500 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
        >
          Sign in
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
  );
}