import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Starter",
    price: "0",
    per: ["free", "forever"],
    cta: "Get Started",
    href: "/sign-up",
    highlight: false,
    features: [
      "Digital health records",
      "Patient card with 1 hospital",
      "Basic record sharing",
    ],
  },
  {
    name: "Plus",
    price: "29",
    per: ["per month", "billed annually"],
    cta: "Start for free",
    href: "/sign-up",
    highlight: true,
    features: [
      "Everything in Starter",
      "Dependents & family profiles",
      "Emergency access pass",
      "Consent & audit log",
    ],
  },
  {
    name: "Hospital",
    price: "99",
    per: ["per month", "billed annually"],
    cta: "Contact Us",
    href: "/sign-up",
    highlight: false,
    features: [
      "Everything in Plus",
      "Staff accounts & roles",
      "Verified entry workflow",
      "Dedicated support",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-foreground/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-mix mb-6 tracking-tight text-3xl font-semibold text-foreground sm:text-4xl">
              Simple, honest pricing
            </h2>
            <p className="text-base text-foreground/70">
              Start free. Upgrade when your care network grows. No hidden fees,
              no surprise charges.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex min-h-[540px] flex-col overflow-hidden border p-6 py-8 ${
                plan.highlight
                  ? "border-green-600/60 bg-green-600/5"
                  : "border-foreground/10"
              }`}
            >
              {plan.highlight && (
                <span className="absolute right-6 top-6 z-20 rounded-md border border-green-600/40 bg-linear-to-b from-green-600 to-transparent px-3 py-1 font-mono text-sm font-medium text-white">
                  Most Popular
                </span>
              )}

              <div className="relative z-10 flex h-full flex-col">
                <h3 className="text-xl font-medium text-foreground">
                  {plan.name}
                </h3>
                <p className="text-base text-foreground/70">
                  {plan.name === "Starter" && "For individuals getting started"}
                  {plan.name === "Plus" &&
                    "For families and frequent travelers"}
                  {plan.name === "Hospital" && "For clinics and hospitals"}
                </p>

                <div className="flex items-end gap-1 py-6">
                  <span className="text-4xl text-foreground/70">$</span>
                  <span className="text-6xl leading-none text-foreground">
                    {plan.price}
                  </span>
                  <p className="pb-1">
                    <span className="block text-foreground">{plan.per[0]}</span>
                    <span className="block text-foreground/50">
                      {plan.per[1]}
                    </span>
                  </p>
                </div>

                <div className="pb-6">
                  <Link
                    href={plan.href}
                    className={`block w-full border py-3 text-center font-mono text-base transition-all duration-300 ${
                      plan.highlight
                        ? "border-transparent bg-green-600 text-white hover:bg-green-500"
                        : "border-foreground/25 bg-transparent text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-base text-foreground/70"
                    >
                      <Check className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
