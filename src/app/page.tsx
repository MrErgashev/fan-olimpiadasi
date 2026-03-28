import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { WhyParticipate } from "@/components/landing/WhyParticipate";
import { SubjectsGrid } from "@/components/landing/SubjectsGrid";
import { PrizesSection } from "@/components/landing/PrizesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Schedule } from "@/components/landing/Schedule";
import { ResultsPreview } from "@/components/landing/ResultsPreview";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustStrip />
      <WhyParticipate />
      <SubjectsGrid />
      <PrizesSection />
      <HowItWorks />
      <Schedule />
      <ResultsPreview />
      <FAQ />

      {/* Premium ajratuvchi — FAQ va CTA orasida */}
      <div className="bg-navy-950 pt-10 pb-2">
        <div className="flex items-center justify-center gap-4 max-w-container mx-auto px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
          <svg width="12" height="12" viewBox="0 0 12 12" className="text-gold-500/40 shrink-0">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="currentColor" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        </div>
      </div>

      <CTASection />
      <Footer />
    </main>
  );
}
