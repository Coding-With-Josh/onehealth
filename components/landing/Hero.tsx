"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * PHASE 1/3 controls:
 * - The form is client-side only. On submit we validate the email shape and
 *   route to /sign-up — it NEVER posts data anywhere from this page.
 * - No dangerouslySetInnerHTML, no user-supplied URLs.
 */
export function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email to get started.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    router.push("/sign-up");
  }

  return (
    <section className="relative overflow-hidden border-y border-foreground/10">
      {/* Green → Lemon → Yellow brand gradient (radial, low-contrast layers) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(22,163,74,0.35),transparent_60%),radial-gradient(ellipse_45%_40%_at_85%_40%,rgba(220,248,76,0.18),transparent_70%),radial-gradient(ellipse_45%_40%_at_10%_60%,rgba(250,204,21,0.15),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl border-x border-foreground/10 px-4 py-16 sm:py-24 lg:py-28">
          <div className="mx-auto mb-6 flex max-w-max items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
            <span className="inline-block h-1 w-2 bg-current" />
            Patient-first healthcare
            <span className="inline-block h-1 w-2 bg-current" />
          </div>

          <h1 className="mb-6 text-center text-4xl font-medium -tracking-[1.5px] text-foreground sm:text-5xl lg:text-6xl">
            Your health, records & care in{" "}
            <span className="bg-linear-to-r from-green-600 via-lemon-400 to-yellow-400 bg-clip-text text-transparent">
              one place
            </span>
            .
          </h1>

          <p className="mx-auto mb-8 max-w-lg text-center text-base text-foreground/70 sm:mb-12">
            OneHealth keeps your medical stories, prescriptions and hospital
            access together — so you and your doctor are never out of the loop.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="relative mx-auto max-w-[500px]"
          >
            <label htmlFor="hero-email" className="sr-only">
              Email address
            </label>
            <input
              id="hero-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter your email to get started…"
              className="h-16 w-full rounded-full border border-foreground/15 bg-background/70 p-8 pr-20 text-sm text-foreground placeholder:text-foreground/40 focus:border-green-600 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Get started"
              className="absolute right-2 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-500"
            >
              <ArrowUpRight className="size-5" />
            </button>
          </form>
          {error && (
            <p className="mt-3 text-center text-sm text-yellow-500 dark:text-yellow-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}