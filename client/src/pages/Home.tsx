import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import TrustedBy from "../components/home/TrustedBy";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import EncryptionSection from "../components/home/EncryptionSection";
import SpeedSection from "../components/home/SpeedSection";
import Technology from "../components/home/Technology";
import UseCases from "../components/home/UseCases";
import FAQ from "../components/home/FAQ";
import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white grid-bg relative">
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.012] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-[2]">
        <Navbar />
        <Hero />
        <TrustedBy />
        <HowItWorks />
        <Features />
        <EncryptionSection />
        <SpeedSection />
        <Technology />
        <UseCases />
        <FAQ />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
