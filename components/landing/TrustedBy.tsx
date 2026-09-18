/**
 * Trusted-by strip. Wordmarks are text (no image assets to 404),
 * animated with the CSS-only marquee utilities defined in globals.css.
 */
export function TrustedBy() {
  const partners = [
    "Lagos General",
    "MediTrust",
    "CarePoint",
    "St. Raphael",
    "WellSpring",
    "First Response",
  ];

  const row = partners.map((name) => (
    <li key={name} className="mx-8 font-mono text-base text-foreground/50">
      {name}
    </li>
  ));

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 flex w-[278px] items-center justify-center gap-4">
          <span className="inline-block h-1 w-2 bg-foreground/50" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
            Trusted by
          </span>
          <span className="inline-block h-1 w-2 bg-foreground/50" />
        </div>

        {/* Phase 3: pure CSS marquee — no JS, no runtime DOM mutation */}
        <div className="marquee w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_128px,black_calc(100%-200px),transparent)]">
          <ul className="marquee-track flex w-max items-center">{row}{row}</ul>
        </div>
      </div>
    </section>
  );
}