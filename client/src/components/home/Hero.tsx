import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Lock,
  CloudOff,
  UploadCloud,
  Download,
} from "lucide-react";
import { useRef } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] max-w-[1000px] bg-accent/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vh] bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Floating UI Cards (Parallax) */}
      <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[25%] left-[10%] glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        >
          <Shield size={14} className="text-emerald-500" /> AES-256 Encrypted
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="absolute top-[40%] right-[12%] glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium border-accent/20 shadow-[0_0_20px_rgba(79,140,255,0.1)]"
        >
          <Zap size={14} className="text-accent" /> Up to 2.4 GB/s
        </motion.div>

        <motion.div
          style={{ y: y3 }}
          className="absolute bottom-[30%] left-[15%] glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium border-white/10"
        >
          <CloudOff size={14} className="text-subtle" /> No Cloud Storage
        </motion.div>

        <motion.div
          style={{ y: y1 }}
          className="absolute bottom-[20%] right-[20%] glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium border-white/10"
        >
          <Lock size={14} className="text-subtle" /> Direct Browser Connection
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 mt-12">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-6xl font-bold tracking-[-0.04em] text-white md:text-[84px] leading-[1.05]"
        >
          Transfer files.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
            Instantly. Securely.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mt-6 max-w-xl mx-auto text-lg md:text-xl leading-relaxed text-subtle"
        >
          A premium peer-to-peer file sharing experience. No servers, no
          uploads, no limits. Directly from browser to browser.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/app"
            className="glow-btn group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-background transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
          >
            Launch Peerly
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* The Immersive Visual Canvas */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-5xl mx-auto mt-24 px-6"
      >
        <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-3xl border border-white/10 glass overflow-hidden shadow-2xl">
          {/* Browser Window Chrome */}
          <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/10 bg-white/[0.02] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="mx-auto w-48 h-5 rounded-md bg-white/[0.04] border border-white/5 flex items-center justify-center">
              <span className="text-[9px] text-white/40 font-mono tracking-wider">
                peerly.app
              </span>
            </div>
          </div>

          {/* Transfer Visualization */}
          <div className="absolute inset-0 pt-10 flex items-center justify-between px-8 md:px-24">
            {/* Sender UI */}
            <div className="w-24 md:w-32 flex flex-col items-center">
              <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 flex items-center justify-center relative">
                <UploadCloud className="text-accent/60" size={24} />
                {/* Simulated file rising */}
                <motion.div
                  className="absolute bottom-2 w-10 h-12 bg-white/10 rounded border border-white/20"
                  animate={{ y: [-10, -40, -10], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <span className="mt-4 text-[10px] uppercase tracking-widest text-subtle font-medium">
                Sender
              </span>
            </div>

            {/* The Tunnel Connection */}
            <div className="flex-1 relative h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-emerald-500/0" />

              {/* Path line */}
              <svg
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0,64 C 30,64 30,64 60,64 L 140,64 C 170,64 170,64 200,64"
                  stroke="url(#tunnel-grad)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="4 4"
                />
                <defs>
                  <linearGradient
                    id="tunnel-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(79,140,255,0.2)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(16,185,129,0.2)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Data Packets flow */}
              <div className="absolute w-full h-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </div>

              {/* Center status */}
              <div className="absolute top-4 glass px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <Lock size={12} className="text-white/60" />
                <span className="text-[10px] font-mono text-white/80">
                  DTLS 1.2+ Channel
                </span>
              </div>
            </div>

            {/* Receiver UI */}
            <div className="w-24 md:w-32 flex flex-col items-center">
              <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center relative overflow-hidden">
                <Download className="text-emerald-500/60" size={24} />
                {/* Simulated file arriving */}
                <motion.div
                  className="absolute top-2 w-10 h-12 bg-white/10 rounded border border-white/20"
                  animate={{ y: [-20, 10, -20], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
              <span className="mt-4 text-[10px] uppercase tracking-widest text-subtle font-medium">
                Receiver
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
