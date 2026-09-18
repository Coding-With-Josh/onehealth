"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CheckboxLine } from "@/components/auth/CheckboxLine";
import { InputField } from "@/components/auth/InputField";
import { SocialButtons } from "@/components/auth/SocialButtons";

const formFields = [
  { label: "First name", value: "Harshit", type: "text", placeholder: "Harshit" },
  { label: "Last name", value: "Sharma", type: "text", placeholder: "Sharma" },
];

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="#"
      className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55"
    >
      Privacy Policy
    </a>
  </>
);

export default function SignUpPage() {
  return (
    <AuthLayout title="Create an account">
      <SocialButtons />

      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {formFields.map((field) => (
            <InputField
              key={field.label}
              label={field.label}
              value={field.value}
              placeholder={field.placeholder}
              type={field.type}
            />
          ))}
        </div>

        <InputField
          label="Email"
          value="harshitlog@gmail.com"
          placeholder="email@example.com"
          type="email"
        />

        <InputField
          label="Password"
          value="*************"
          placeholder="Enter password"
          type="password"
        />

        <div className="space-y-3 pt-2 text-xs leading-5 text-black/45 dark:text-white/40 sm:text-[13px]">
          <CheckboxLine>
            I don&apos;t want to receive emails about OneHealth feature updates
            and best practices.
          </CheckboxLine>
          <CheckboxLine>{termsText}</CheckboxLine>
        </div>

        <button
          type="button"
          className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-green-500 bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600 dark:border-green-500 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
        >
          Submit
        </button>

        <p className="pt-2 text-center text-sm text-black/45 dark:text-white/40">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-green-600 underline underline-offset-2 dark:text-green-400"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}