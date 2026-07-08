import { motion } from "framer-motion";
import { Radio, Zap, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-subtle max-w-md">
            Three steps. No sign-up. No configuration required.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Step 1 — Large card, spans 2 rows */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:row-span-2 rounded-2xl border border-white/6 bg-card p-8 md:p-10 flex flex-col justify-between min-h-[320px] group hover:border-white/12 transition-colors"
          >
            <div>
              <span className="text-xs text-accent font-mono font-medium">
                01
              </span>
              <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-muted group-hover:text-accent transition-colors">
                <Radio size={22} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                Discover peers
              </h3>
              <p className="mt-3 text-subtle leading-relaxed">
                Both users connect to a lightweight signaling server via
                WebSocket. You'll see all available peers in the sidebar —
                select one to initiate a connection request.
              </p>
            </div>
            {/* Visual — Connection dots */}
            <div className="mt-8 flex items-center gap-3 opacity-30 group-hover:opacity-50 transition-opacity">
              <div className="w-3 h-3 rounded-full border border-accent/60" />
              <div className="flex-1 h-px bg-gradient-to-r from-accent/40 via-accent/20 to-transparent relative">
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-[dot-pulse_2s_ease-in-out_infinite]" />
                <div className="absolute left-2/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-[dot-pulse_2s_ease-in-out_infinite_0.4s]" />
                <div className="absolute left-3/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-[dot-pulse_2s_ease-in-out_infinite_0.8s]" />
              </div>
              <div className="w-3 h-3 rounded-full bg-accent/60" />
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/6 bg-card p-8 group hover:border-white/12 transition-colors"
          >
            <span className="text-xs text-accent font-mono font-medium">
              02
            </span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-muted group-hover:text-accent transition-colors">
              <Zap size={22} />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">
              Establish link
            </h3>
            <p className="mt-2 text-sm text-subtle leading-relaxed">
              Once accepted, WebRTC negotiates a direct DataChannel between
              both browsers. The signaling server steps away — your data
              never touches it.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/6 bg-card p-8 group hover:border-white/12 transition-colors"
          >
            <span className="text-xs text-accent font-mono font-medium">
              03
            </span>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-muted group-hover:text-accent transition-colors">
              <CheckCircle size={22} />
            </div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">
              Transfer files
            </h3>
            <p className="mt-2 text-sm text-subtle leading-relaxed">
              Files are chunked into 64KB segments, streamed through the
              DataChannel, and reassembled on the other end. Progress
              tracked in real-time.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
