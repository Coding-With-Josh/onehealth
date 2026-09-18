import Link from "next/link";

/**
 * Footer columns. Destinations that don't exist as routes yet render as inert
 * spans (Phase 3: no dead links / 404s for the visitor).
 */
const COLUMNS: { heading: string; links: { label: string; href?: string }[] }[] =
  [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Sign in", href: "/sign-in" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "FAQ", href: "#faq" },
        { label: "Help Center" },
        { label: "API Reference" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About Us" },
        { label: "Careers" },
        { label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy" },
        { label: "Terms of Service" },
        { label: "Cookie Policy" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 pt-10 lg:pt-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 lg:pb-24">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {col.heading}
              </h3>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="block text-sm leading-5 text-foreground/50 transition hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <span className="block cursor-default text-sm leading-5 text-foreground/50">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-5 border-t border-foreground/10 pb-8 pt-4 sm:flex-row">
          <p className="text-sm leading-5 text-foreground/50">
            © {new Date().getFullYear()} OneHealth. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm leading-5 text-foreground/50">
              Privacy Policy
            </span>
            <span className="text-sm leading-5 text-foreground/50">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}