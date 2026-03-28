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
      <CTASection />
      <Footer />
    </main>
  );
}
