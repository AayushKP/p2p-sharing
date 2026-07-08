import { motion } from "framer-motion";
import { Globe, Server, Wifi } from "lucide-react";

const cards = [
  {
    icon: Server,
    title: "No middleman",
    desc: "Data flows directly between two browsers. The server only exists for discovery.",
  },
  {
    icon: Globe,
    title: "No cloud dependency",
    desc: "Nothing is uploaded to any service. Files exist only on sender and receiver machines.",
  },
  {
    icon: Wifi,
    title: "LAN speed capable",
    desc: "Peers on the same network transfer at near-wire speed. No bandwidth wasted on round-trips.",
  },
];

export default function Technology() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-start">
          {/* Left — Stacked info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3 order-2 md:order-1"
          >
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 group hover:border-white/15 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted group-hover:text-accent transition-colors">
                    <card.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {card.title}
                    </h4>
                    <p className="mt-1 text-xs text-subtle leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right — Editorial text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <span className="text-xs text-accent font-mono font-medium uppercase tracking-wider">
              Architecture
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Why peer-to-peer?
            </h2>
            <p className="mt-4 text-subtle leading-relaxed">
              Traditional file sharing routes your data through servers — adding
              latency, cost, and privacy risk. Peerly eliminates the middleman
              entirely.
            </p>
            <p className="mt-4 text-subtle leading-relaxed">
              The signaling server handles only discovery and connection setup
              using{" "}
              <span className="text-white font-medium">WebSockets</span>. Once
              the{" "}
              <span className="text-white font-medium">WebRTC DataChannel</span>{" "}
              is established, all file data flows directly between the two peers.
              There is{" "}
              <span className="text-white font-medium">
                no server-side file handling
              </span>
              , ever.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
