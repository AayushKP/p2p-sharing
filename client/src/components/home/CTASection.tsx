import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.04] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/[0.06] rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 text-center mx-auto max-w-lg px-6"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Ready to share?
        </h2>
        <p className="mt-4 text-subtle text-lg">
          No sign-up. No install. Open your browser and start transferring.
        </p>
        <div className="mt-8">
          <Link
            to="/app"
            id="cta-launch"
            className="glow-btn group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-background transition-all"
          >
            Launch Peerly
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
