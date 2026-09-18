import {
  CalendarClock,
  FileHeart,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: FileHeart,
    title: "Digital Health Records",
    body: "Every test result, prescription and visit note in one searchable place.",
  },
  {
    icon: Smartphone,
    title: "Patient Card & Access",
    body: "A secure digital card that unlocks your records with any connected hospital.",
  },
  {
    icon: CalendarClock,
    title: "Visits & Follow-ups",
    body: "Book appointments and never miss a scheduled follow-up again.",
  },
  {
    icon: ShieldCheck,
    title: "Emergency Access",
    body: "First responders get read-only access to the essentials exactly when it matters.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-y border-foreground/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 className="font-mix mb-6 tracking-tight text-3xl font-semibold text-foreground sm:text-4xl">
              What You Get
            </h2>
            <p className="text-base text-foreground/70">
              OneHealth puts your whole care story in your pocket — and gives
              hospitals a safe, consent-based way to read what they need.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group relative flex h-full flex-col overflow-hidden border border-foreground/10 p-8 transition-all duration-300 ease-in-out hover:border-green-600/60"
            >
              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6">
                  <f.icon className="size-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-3 text-2xl -tracking-[1px] text-foreground">
                  {f.title}
                </h3>
                <p className="mb-14 text-base text-foreground/70">{f.body}</p>
                <Link
                  href="/sign-in"
                  className="mt-auto w-fit font-mono text-sm text-foreground/70 underline-offset-4 transition-colors hover:text-green-600 hover:underline dark:hover:text-green-400"
                >
                  Try now
                </Link>
              </div>
              {/* Decorative gradient wash on hover (no image assets) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -bottom-16 h-40 bg-linear-to-t from-green-600/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
