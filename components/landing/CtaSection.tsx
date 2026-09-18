import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-b border-foreground/10 py-20">
      {/* Phase 3: decorative only; no image assets, no user input */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_100%,rgba(22,163,74,0.18),transparent_70%),radial-gradient(ellipse_40%_50%_at_80%_20%,rgba(220,248,76,0.12),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <h2 className="mb-4 text-5xl text-foreground">
          Ready to take control of your health?
        </h2>
        <p className="mb-8 text-center text-foreground/70">
          Create your free record in minutes — no coding, no hassle.
        </p>
        <div className="flex flex-col justify-center gap-6 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-full bg-green-600 px-6 py-3 font-mono text-base text-white transition-all duration-300 hover:bg-green-500"
          >
            Start for free
          </Link>
          <Link
            href="#features"
            className="rounded-full border border-foreground/25 px-6 py-3 font-medium text-foreground transition-all duration-300 hover:bg-foreground/10"
          >
            Explore features
          </Link>
        </div>
      </div>
    </section>
  );
}