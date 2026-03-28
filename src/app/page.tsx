import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SubjectsGrid } from "@/components/landing/SubjectsGrid";
import { PrizePodium } from "@/components/landing/PrizePodium";
import { Schedule } from "@/components/landing/Schedule";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SubjectsGrid />
      <PrizePodium />
      <Schedule />
      <ContactSection />
      <Footer />
    </main>
  );
}
