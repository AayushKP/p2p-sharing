import { motion } from "framer-motion";

const techs = ["WebRTC", "React", "TypeScript", "Node.js", "Vite"];

export default function TrustedBy() {
  return (
    <section className="border-y border-white/[0.04] py-10">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-4"
        >
          <span className="text-[11px] text-subtle uppercase tracking-[0.15em] font-medium">
            Built with
          </span>
          <div className="flex items-center gap-1">
            {techs.map((tech, i) => (
              <span
                key={tech}
                className="text-[13px] font-medium text-muted/50 px-3 py-1"
              >
                {tech}
                {i < techs.length - 1 && (
                  <span className="ml-4 text-white/10">·</span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
