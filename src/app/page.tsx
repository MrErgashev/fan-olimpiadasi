import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SubjectsGrid } from "@/components/landing/SubjectsGrid";
import { PrizePodium } from "@/components/landing/PrizePodium";
import { Schedule } from "@/components/landing/Schedule";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="noise-overlay">
      <Navbar />
      <Hero />
      <div className="gradient-divider" />
      <SubjectsGrid />
      <div className="gradient-divider" />
      <PrizePodium />
      <div className="gradient-divider" />
      <Schedule />
      <div className="gradient-divider" />
      <ContactSection />
      <Footer />
    </main>
  );
}
