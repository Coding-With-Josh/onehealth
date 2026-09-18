"use client";

/**
 * Patient registration — wired to POST /api/v1/auth/register/patient/.
 *
 * Field set matches the API's PatientRegistrationSerializer exactly:
 * email, password, phone_number, full_name, date_of_birth, gender,
 * blood_type. Fields are allow-listed in code (Phase 3 — no dynamic
 * spreading of form state), so an injected or unexpected field can never
 * reach the API as part of this page's payload.
 *
 * The API does not return JWT tokens for registration — the patient must
 * sign in once; we redirect to /sign-in on success.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api/client";
import { rawRequest } from "@/lib/api/client";
import { GuestPage } from "@/lib/auth/guards";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CheckboxLine } from "@/components/auth/CheckboxLine";
import { FormError } from "@/components/auth/FormError";
import { InputField } from "@/components/auth/InputField";

const BLOOD_TYPES = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const termsText = (
  <>
    I agree to the{" "}
    <a href="#" className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55">
      Terms of Service
    </a>{" "}
    and{" "}
    <a href="#" className="font-medium text-black/55 underline underline-offset-2 dark:text-white/55">
      Privacy Policy
    </a>
    .
  </>
);

interface FieldErrors {
  [key: string]: string[];
}

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<{
    message: string;
    errors?: Record<string, string[]> | string[];
  } | null>(null);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!fullName.trim()) errors.full_name = ["Full name is required."];
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = ["Enter a valid email address."];
    }
    const digits = phone.replace(/[\s-]/g, "");
    if (!/^\+?\d{10,15}$/.test(digits)) {
      errors.phone_number = ["Enter a valid phone number (10–15 digits)."];
    }
    if (!dateOfBirth) {
      errors.date_of_birth = ["Date of birth is required."];
    } else if (new Date(`${dateOfBirth}T00:00:00`) > new Date()) {
      errors.date_of_birth = ["Date of birth cannot be in the future."];
    }
    if (!gender) errors.gender = ["Select a gender."];
    if (password.length < 10) {
      errors.password = ["Password must be at least 10 characters."];
    }
    if (password !== confirmPassword) {
      errors.confirm_password = ["Passwords do not match."];
    }
    if (!acceptedTerms) {
      // Deliberately not sent to the API (no server field) — client gate only.
      errors.terms = ["You must accept the Terms of Service and Privacy Policy."];
    }
    return errors;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return; // guard: no double submit
    setError(null);

    const clientErrors = validate();
    setClientErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    try {
      // Allow-listed payload: exactly the API's expected fields, nothing else.
      await rawRequest("/auth/register/patient/", {
        method: "POST",
        body: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone_number: phone.replace(/[\s-]/g, ""),
          date_of_birth: dateOfBirth, // YYYY-MM-DD from input type=date
          gender,
          blood_type: bloodType,
          password,
        },
      });
      router.replace("/sign-in");
    } catch (err) {
      if (err instanceof ApiError) {
        // Map API field errors onto the form so the user sees exactly
        // what to fix (Phase 1 B1 — server validation is authoritative).
        setError({ message: err.message, errors: err.fieldErrors ?? undefined });
        if (err.fieldErrors) setClientErrors(err.fieldErrors);
      } else {
        setError({ message: "Unable to create your account. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GuestPage>
      <AuthLayout title="Create an account">
        <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
          <InputField
            label="Full name"
            name="full_name"
            value={fullName}
            onChange={setFullName}
            placeholder="Your full name"
            autoComplete="name"
            required
            error={clientErrors.full_name?.[0]}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Email"
              name="email"
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
              autoComplete="email"
              required
              error={clientErrors.email?.[0]}
            />
            <InputField
              label="Phone number"
              name="phone_number"
              value={phone}
              onChange={setPhone}
              placeholder="08012345678"
              type="tel"
              autoComplete="tel"
              required
              error={clientErrors.phone_number?.[0]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="w-full space-y-1.5 text-left">
              <label htmlFor="date_of_birth" className="mb-2 block text-sm font-semibold text-black/60 dark:text-white/60">
                Date of birth
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                aria-invalid={clientErrors.date_of_birth ? true : undefined}
                className={`h-11 w-full rounded-2xl border bg-white px-3.5 text-sm text-black outline-none dark:bg-white/5 dark:text-white ${
                  clientErrors.date_of_birth
                    ? "border-red-400 dark:border-red-500/60"
                    : "border-black/15 dark:border-white/10"
                }`}
              />
              {clientErrors.date_of_birth?.[0] && (
                <p className="text-xs text-red-600 dark:text-red-400">{clientErrors.date_of_birth[0]}</p>
              )}
            </div>

            <div className="w-full space-y-1.5 text-left">
              <label htmlFor="gender" className="mb-2 block text-sm font-semibold text-black/60 dark:text-white/60">
                Gender
                <span className="ml-0.5 text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                aria-invalid={clientErrors.gender ? true : undefined}
                className={`h-11 w-full rounded-2xl border bg-white px-3.5 text-sm text-black outline-none dark:bg-white/5 dark:text-white ${
                  clientErrors.gender
                    ? "border-red-400 dark:border-red-500/60"
                    : "border-black/15 dark:border-white/10"
                }`}
              >
                <option value="" disabled>
                  Select…
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {clientErrors.gender?.[0] && (
                <p className="text-xs text-red-600 dark:text-red-400">{clientErrors.gender[0]}</p>
              )}
            </div>
          </div>

          <div className="w-full space-y-1.5 text-left">
            <label htmlFor="blood_type" className="mb-2 block text-sm font-semibold text-black/60 dark:text-white/60">
              Blood type <span className="font-normal text-black/35 dark:text-white/35">(optional)</span>
            </label>
            <select
              id="blood_type"
              name="blood_type"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="h-11 w-full rounded-2xl border border-black/15 bg-white px-3.5 text-sm text-black outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {BLOOD_TYPES.map((bt) => (
                <option key={bt || "unknown"} value={bt}>
                  {bt || "Prefer not to say"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Password"
              name="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 10 characters"
              type="password"
              autoComplete="new-password"
              required
              error={clientErrors.password?.[0]}
              hint="Minimum 10 characters."
            />
            <InputField
              label="Confirm password"
              name="confirm_password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              type="password"
              autoComplete="new-password"
              required
              error={clientErrors.confirm_password?.[0]}
            />
          </div>

          <div className="space-y-3 pt-2 text-xs leading-5 text-black/45 dark:text-white/40 sm:text-[13px]">
            <label className="flex cursor-pointer items-start gap-3">
              <span className="relative mt-1 size-3.5 shrink-0">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer size-full cursor-pointer appearance-none rounded-[3px] border border-black/25 bg-white checked:border-green-600 checked:bg-green-600 dark:border-white/30 dark:bg-white/5 dark:checked:border-green-500 dark:checked:bg-green-500"
                />
                <svg
                  viewBox="0 0 12 12"
                  className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6.2 5 8.1 9 3.9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{termsText}</span>
            </label>
            {clientErrors.terms?.[0] && (
              <p className="text-xs text-red-600 dark:text-red-400">{clientErrors.terms[0]}</p>
            )}
            <CheckboxLine>
              I don&apos;t want to receive emails about OneHealth feature updates and best practices.
            </CheckboxLine>
          </div>

          <FormError message={error?.message} errors={error?.errors} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-green-500 bg-green-500 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-500 dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
          >
            {submitting ? "Creating account…" : "Create account"}
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
    </GuestPage>
  );
}