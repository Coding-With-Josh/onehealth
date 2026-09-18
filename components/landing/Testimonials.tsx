const TESTIMONIALS_ROW_1 = [
  {
    name: "Lydia Carter",
    handle: "@lyd_carter21",
    body: "Moved cities and my new hospital pulled up my full history in seconds. No fax machine involved.",
    initials: "LC",
    color: "bg-green-600",
  },
  {
    name: "Marcus Thompson",
    handle: "@m_thompson",
    body: "Managing my dad's records from one account saved us three ER repeat-visits this year.",
    initials: "MT",
    color: "bg-yellow-400",
  },
  {
    name: "Sarah Mitchell",
    handle: "@sarah_m",
    body: "The emergency access pass is the reason I feel safe hiking alone now.",
    initials: "SM",
    color: "bg-lemon-400",
  },
  {
    name: "James Wilson",
    handle: "@j_wilson",
    body: "Consent-first. Every nurse who touches my file leaves a trace I can see. Exactly how it should be.",
    initials: "JW",
    color: "bg-green-600/70",
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    name: "Emily Davis",
    handle: "@emily_d",
    body: "As a diabetic, having my labs, prescriptions and next appointment in one app is a genuine upgrade.",
    initials: "ED",
    color: "bg-yellow-400/80",
  },
  {
    name: "David Brown",
    handle: "@d_brown",
    body: "Our clinic cut registration time by three minutes per patient. That's a full-time nurse back, basically.",
    initials: "DB",
    color: "bg-green-600",
  },
  {
    name: "Jessica Taylor",
    handle: "@jess_t",
    body: "The verified-entry workflow finally tells me which doctor actually signed off on a result.",
    initials: "JT",
    color: "bg-lemon-400",
  },
  {
    name: "Michael Johnson",
    handle: "@mike_j",
    body: "Dependents, guardians, audit log — the family-care setup is the best I've seen anywhere.",
    initials: "MJ",
    color: "bg-green-600/70",
  },
];

function TestimonialCard({
  t,
}: {
  t: (typeof TESTIMONIALS_ROW_1)[number];
}) {
  return (
    <li className="min-w-[420px] border border-foreground/10 bg-foreground/[0.03] p-6">
      <div className="mb-2 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-12 items-center justify-center rounded-full font-mono text-sm text-white ${t.color}`}
        >
          {t.initials}
        </span>
        <div>
          <h4 className="text-xl font-medium text-foreground">{t.name}</h4>
          <span className="text-base text-foreground/50">{t.handle}</span>
        </div>
      </div>
      <p className="text-base text-foreground/70">{t.body}</p>
    </li>
  );
}

export function Testimonials() {
  return (
    <section className="border-y border-foreground/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-lg text-center">
          <h2 className="mb-6 text-3xl font-medium text-foreground sm:text-4xl">
            Hear from our community
          </h2>
          <p className="text-base text-foreground/70">
            Patients, guardians and clinics use OneHealth to keep care
            connected — in minutes, not weeks.
          </p>
        </div>

        <div className="marquee mb-6 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_128px,black_calc(100%-200px),transparent)]">
          <ul className="marquee-track flex w-max items-center gap-4">
            {TESTIMONIALS_ROW_1.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
            {TESTIMONIALS_ROW_1.map((t) => (
              <TestimonialCard key={`${t.name}-dup`} t={t} />
            ))}
          </ul>
        </div>

        <div className="marquee w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_128px,black_calc(100%-200px),transparent)]">
          <ul className="marquee-track-right flex w-max items-center gap-4">
            {TESTIMONIALS_ROW_2.map((t) => (
              <TestimonialCard key={t.name} t={t} />
            ))}
            {TESTIMONIALS_ROW_2.map((t) => (
              <TestimonialCard key={`${t.name}-dup`} t={t} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}