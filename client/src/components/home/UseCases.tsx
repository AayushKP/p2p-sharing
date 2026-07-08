import { motion } from "framer-motion";
import { Code, Users, Palette, Send } from "lucide-react";

const useCases = [
  {
    icon: Code,
    title: "Developers",
    desc: "Share builds, logs, and debug files with teammates without leaving the browser.",
  },
  {
    icon: Users,
    title: "Remote Teams",
    desc: "Send documents and assets to colleagues securely — no Slack upload limits.",
  },
  {
    icon: Palette,
    title: "Designers",
    desc: "Transfer large design files, mockups, and assets directly to your client.",
  },
  {
    icon: Send,
    title: "Quick Shares",
    desc: "Drop a file to someone sitting next to you. Faster than AirDrop, works on any device.",
  },
];

export default function UseCases() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for everyone.
          </h2>
          <p className="mt-3 text-subtle text-lg">
            A few ways people use Peerly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-white/6 bg-card p-6 hover:border-white/12 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-muted group-hover:text-accent transition-colors mb-5">
                <item.icon size={20} />
              </div>
              <h3 className="text-[15px] font-semibold mb-1.5">{item.title}</h3>
              <p className="text-xs text-subtle leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
