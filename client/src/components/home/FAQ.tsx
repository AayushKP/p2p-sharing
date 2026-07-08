import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Peerly?",
    a: "Peerly is a peer-to-peer file sharing tool that lets you transfer files directly between browsers using WebRTC. No server ever stores or processes your files.",
  },
  {
    q: "Is it free to use?",
    a: "Yes, Peerly is completely free and open-source. There are no hidden costs, subscriptions, or usage limits.",
  },
  {
    q: "How secure is the transfer?",
    a: "All WebRTC DataChannels are encrypted with DTLS 1.2+ by default. Your data is encrypted in transit and never touches a server — only the sender and receiver can read it.",
  },
  {
    q: "Are there file size limits?",
    a: "There are no hard limits. Peerly uses 64KB chunked streaming with backpressure handling, so large files transfer reliably. Speed depends on your network connection.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. Peerly works in any modern browser that supports WebRTC — including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.",
  },
  {
    q: "What happens if the connection drops?",
    a: "If the WebRTC connection drops, the transfer stops. You'll need to reconnect and restart the transfer. Partial file recovery is not currently supported.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Questions & answers
          </h2>
          <p className="mt-3 text-subtle text-lg">
            Everything you need to know.
          </p>
        </motion.div>

        <div className="divide-y divide-white/6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left group"
              >
                <span className="text-[15px] font-medium text-white group-hover:text-accent transition-colors pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-subtle shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm text-subtle leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
