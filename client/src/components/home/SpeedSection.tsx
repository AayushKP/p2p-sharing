import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const comparisons = [
  { label: "Peerly (WebRTC)", speed: "Up to 2.4 GB/s", width: 92, accent: true },
  { label: "Cloud Upload", speed: "~100 MB/s", width: 38, accent: false },
  { label: "Email Attachment", speed: "~25 MB/s", width: 12, accent: false },
];

export default function SpeedSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs text-accent font-mono font-medium uppercase tracking-wider">
            Performance
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Faster than cloud.
          </h2>
          <p className="mt-3 text-subtle text-lg max-w-md mx-auto">
            Direct connections eliminate upload and download bottlenecks.
          </p>
        </motion.div>

        <div ref={ref} className="space-y-6 max-w-2xl mx-auto">
          {comparisons.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-sm font-medium ${item.accent ? "text-white" : "text-muted"}`}
                >
                  {item.label}
                </span>
                <span
                  className={`text-xs font-mono ${item.accent ? "text-accent" : "text-subtle"}`}
                >
                  {item.speed}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.accent ? "bg-accent shadow-[0_0_12px_rgba(79,140,255,0.3)]" : "bg-white/10"}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${item.width}%` } : { width: 0 }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-xs text-subtle"
        >
          Speeds depend on network conditions. WebRTC peers on the same LAN
          can achieve near-wire speeds.
        </motion.p>
      </div>
    </section>
  );
}
