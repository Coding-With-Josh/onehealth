import { CtaSection } from "@/components/landing/CtaSection";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Testimonials } from "@/components/landing/Testimonials";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { UseCases } from "@/components/landing/UseCases";

export default function Home() {
  return (
    <div className="bg-background font-sans text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        {/* <TrustedBy /> */}
        <Features />
        <UseCases />
        {/* <Pricing /> */}
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}