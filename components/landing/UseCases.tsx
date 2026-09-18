const USE_CASES = [
  {
    title: "Continuity between hospitals",
    body: "Walk into any connected facility with your full history instead of repeating it.",
  },
  {
    title: "Family & dependent care",
    body: "Manage your children's and elderly relatives' profiles from one guardian account.",
  },
  {
    title: "Faster emergency response",
    body: "Blood type, allergies and critical conditions available to responders in seconds.",
  },
  {
    title: "Verified medical entries",
    body: "Only licensed doctors can mark entries as verified — you always know what holds weight.",
  },
  {
    title: "Consent-first sharing",
    body: "Every record access is explicit, scoped and logged for the audit trail.",
  },
  {
    title: "Quieter admin lines",
    body: "Hospitals verify patient identity against the platform instead of paper stacks.",
  },
];

export function UseCases() {
  return (
    <section className="border-y border-foreground/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-[590px] text-center">
          <h2 className="font-mix mb-6 tracking-tight text-3xl font-semibold text-foreground sm:text-4xl">
            Built for real care journeys
          </h2>
          <p className="text-base text-foreground/70">
            From a first visit to a hospital you've never been to, OneHealth
            makes sure the story follows the patient — not the reception desk.
          </p>
        </div>

        <div className="border border-foreground/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:divide-foreground/10 divide-y divide-foreground/10">
            {USE_CASES.map((c) => (
              <div
                key={c.title}
                className="p-5 transition-colors duration-300 ease-in-out hover:bg-green-600/5 lg:px-8 lg:py-12"
              >
                <h3 className="mb-3 text-2xl -tracking-[1px] text-foreground">
                  {c.title}
                </h3>
                <p className="text-base text-foreground/70">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
