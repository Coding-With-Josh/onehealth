"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Phase 3 control: every href in this header is a compile-time constant —
 * no user-supplied URL can reach the DOM.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="font-mix text-2xl tracking-tight text-foreground">
            onehealth
          </Link>

          <ul className="hidden lg:flex lg:space-x-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-block py-4 text-sm text-foreground/60 transition-colors duration-300 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/sign-in"
              className="rounded-full px-5 py-2.5 font-sans tracking-tight text-sm font-medium text-foreground ring-1 ring-foreground/25 transition-all duration-300 hover:bg-foreground/10"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-green-600 px-5 py-2.5 font-sans text-sm tracking-tight font-medium text-white transition-all duration-300 hover:bg-green-500"
            >
              Start for free
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((v) => !v)}
            className="ml-5 text-foreground lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-foreground/10 pb-6 lg:hidden">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="inline-block py-3 text-foreground/70 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-3">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full px-5 py-2.5 text-center font-mono text-sm font-medium text-foreground ring-1 ring-foreground/25"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-green-600 px-5 py-2.5 text-center font-mono text-sm font-medium text-white"
              >
                Start for free
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}