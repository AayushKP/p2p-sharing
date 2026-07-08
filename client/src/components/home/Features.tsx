import { motion } from "framer-motion";
import {
  Zap,
  ServerOff,
  HardDrive,
  Lock,
  UserCheck,
  Activity,
} from "lucide-react";
import clsx from "clsx";

const features = [
  {
    title: "Direct P2P Transfer",
    desc: "Files stream straight between browsers over WebRTC DataChannels. No intermediary server ever touches your data.",
    metric: "0 servers",
    icon: Zap,
    className: "md:col-span-2 md:row-span-2",
    large: true,
  },
  {
    title: "No Server Storage",
    desc: "Your files never leave the connection. Nothing is uploaded, cached, or stored anywhere.",
    metric: "0 bytes stored",
    icon: ServerOff,
    className: "",
  },
  {
    title: "Large File Support",
    desc: "Chunked streaming with backpressure handling keeps transfers stable at any size.",
    metric: "64KB chunks",
    icon: HardDrive,
    className: "",
  },
  {
    title: "Secure by Design",
    desc: "WebRTC encrypts all data in transit. No plaintext. No leaks.",
    metric: "DTLS 1.2+",
    icon: Lock,
    className: "",
  },
  {
    title: "Connection Control",
    desc: "Accept or decline requests. You decide who gets access.",
    metric: "Full control",
    icon: UserCheck,
    className: "",
  },
  {
    title: "Real-Time Progress",
    desc: "Live progress tracking with chunk-level updates. See exactly how much has been sent and received, in real time.",
    metric: "Live updates",
    icon: Activity,
    className: "md:col-span-4",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="mb-16 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight md:text-5xl"
          >
            Everything you need.
            <br />
            <span className="text-muted">Nothing you don't.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-subtle"
          >
            Built for speed, simplicity, and security. Every feature serves a
            purpose.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:auto-rows-[200px]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={clsx(
                "group relative flex flex-col justify-between overflow-hidden",
                "rounded-2xl border border-white/6 bg-card p-6 md:p-7",
                "transition-all duration-300 hover:border-white/12 hover:shadow-[0_0_40px_-12px_rgba(79,140,255,0.1)]",
                f.className
              )}
            >
              {/* Hover glow */}
              <div className="absolute -right-12 -top-12 h-32 w-32 bg-accent/[0.04] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div
                  className={clsx(
                    "inline-flex items-center justify-center rounded-xl bg-white/[0.04] text-muted group-hover:text-accent transition-colors",
                    f.large
                      ? "h-12 w-12 mb-6"
                      : "h-10 w-10 mb-4"
                  )}
                >
                  <f.icon size={f.large ? 22 : 18} />
                </div>
                <h3
                  className={clsx(
                    "font-semibold tracking-tight",
                    f.large ? "text-xl mb-2" : "text-[15px] mb-1.5"
                  )}
                >
                  {f.title}
                </h3>
                <p
                  className={clsx(
                    "text-subtle leading-relaxed",
                    f.large ? "text-sm max-w-sm" : "text-xs"
                  )}
                >
                  {f.desc}
                </p>
              </div>

              {/* Metric badge */}
              <div className="relative z-10 mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/6 bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-muted uppercase tracking-wider">
                  {f.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
