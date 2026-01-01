import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import HowItWorks from "../components/home/HowItWorks";
import Features from "../components/home/Features";
import Technology from "../components/home/Technology";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Technology />
      <Footer />
    </div>
  );
}
