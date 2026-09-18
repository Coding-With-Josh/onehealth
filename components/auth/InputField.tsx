"use client";

/**
 * Controlled text/password input for auth and other forms.
 *
 * Rewritten from the original demo component: the old version hid its
 * value inside local state (clear-on-focus demo behavior), which made it
 * impossible to submit real data. This version is fully controlled —
 * the parent owns `value`/`onChange` for form submission.
 */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  error,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5 text-left">
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-black/60 dark:text-white/60">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div
        className={`relative flex h-11 items-center rounded-2xl border bg-white px-3.5 dark:bg-white/5 ${
          error
            ? "border-red-400 dark:border-red-500/60"
            : "border-black/15 dark:border-white/10"
        }`}
      >
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${name}-help` : undefined}
          className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/30 dark:text-white dark:placeholder:text-white/30"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 cursor-pointer text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {(error || hint) && (
        <p
          id={`${name}-help`}
          className={`text-xs ${error ? "text-red-600 dark:text-red-400" : "text-black/40 dark:text-white/40"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}