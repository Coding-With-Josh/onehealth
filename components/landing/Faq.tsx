const FAQS = [
  {
    q: "What is OneHealth?",
    a: "OneHealth is a personal health records platform. It keeps your medical history, prescriptions, visit notes and patient card in one place, and gives hospitals consent-based access to exactly what they need.",
  },
  {
    q: "Is my medical data secure?",
    a: "Yes. Every record access is explicit, scoped and logged to an audit trail. Nothing is shared with a hospital unless you (or an emergency responder with your authorization) trigger it.",
  },
  {
    q: "How does emergency access work?",
    a: "The emergency access pass exposes only read-only essentials — blood type, allergies, critical conditions — to verified responders for a short, configurable window. It never grants write access.",
  },
  {
    q: "Can I manage my family's records?",
    a: "Guardians can register dependents (children or elderly relatives) and manage their profiles from a single account. Dependents don't need their own login.",
  },
  {
    q: "Who can verify a medical entry?",
    a: "Only licensed doctors with a professional license number can mark entries as verified — so you can always tell which entries carry clinical weight.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-y border-foreground/10 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-28">
          <div className="mb-10 lg:mb-0">
            <h2 className="mb-6 text-3xl font-medium text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mb-6 text-base text-foreground/70">
              If you can't find what you're looking for, reach out to our
              support team — we're happy to help.
            </p>
          </div>

          <div>
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group border-b border-foreground/10 py-6"
              >
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4">
                  <h3 className="text-lg -tracking-[0.18px] text-foreground">
                    {faq.q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full border border-foreground/20 text-foreground/70 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/70">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}