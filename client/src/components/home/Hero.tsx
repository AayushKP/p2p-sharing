import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Globe } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[20%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <div className="z-10 max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-400 backdrop-blur-sm">
            v1.0 is Live 
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl"
        >
          Share files.Directly. <br />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto max-w-2xl text-lg text-gray-400 md:text-xl"
        >
          Peerly lets you share files instantly using direct peer-to-peer
          connections in the browser. No uploads. No storage. Just real-time
          transfer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/app"
            id="hero-cta-start"
            className="group relative flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500 hover:glow-box"
          >
            Start Sharing
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <button 
            id="hero-cta-how" 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:bg-white/10"
          >
            How It Works
          </button>
        </motion.div>
      </div>

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div 
             animate={{ y: [0, -20, 0] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute left-[10%] top-[40%] text-gray-700"
          >
             <Zap size={48} className="opacity-20" />
          </motion.div>
          
          <motion.div 
             animate={{ y: [0, 20, 0] }}
             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
             className="absolute right-[10%] top-[30%] text-gray-700"
          >
             <Globe size={48} className="opacity-20" />
          </motion.div>
      </div>
    </section>
  );
}
