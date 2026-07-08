import { motion } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";

const metrics = [
  { icon: Shield, label: "DTLS 1.2+ Encryption", value: "AES-256" },
  { icon: Lock, label: "Server Access", value: "Zero" },
  { icon: Eye, label: "Data Stored", value: "None" },
];

export default function EncryptionSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs text-accent font-mono font-medium uppercase tracking-wider">
              Security
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Encrypted by default.
              <br />
              <span className="text-muted">No exceptions.</span>
            </h2>
            <p className="mt-4 text-subtle leading-relaxed max-w-md">
              WebRTC mandates DTLS encryption on every DataChannel. Your files
              travel through an encrypted tunnel that only the two connected
              peers can read. No server, no middleman, no backdoor.
            </p>

            {/* Metric cards */}
            <div className="mt-8 flex flex-wrap gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-card px-4 py-3"
                >
                  <m.icon size={16} className="text-accent" />
                  <div>
                    <div className="text-[11px] text-subtle">{m.label}</div>
                    <div className="text-sm font-semibold text-white">
                      {m.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Tunnel SVG visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <svg
                viewBox="0 0 400 220"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
              >
                {/* Background glow */}
                <defs>
                  <radialGradient id="enc-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4F8CFF" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#4F8CFF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse
                  cx="200"
                  cy="110"
                  rx="180"
                  ry="90"
                  fill="url(#enc-glow)"
                />

                {/* Left node */}
                <circle
                  cx="60"
                  cy="110"
                  r="24"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <circle cx="60" cy="110" r="8" fill="#4F8CFF" />
                <text
                  x="60"
                  y="150"
                  textAnchor="middle"
                  fill="#6B7280"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  Sender
                </text>

                {/* Tunnel pipe */}
                <rect
                  x="105"
                  y="94"
                  width="190"
                  height="32"
                  rx="16"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                  fill="rgba(79,140,255,0.03)"
                />

                {/* Shield in center */}
                <path
                  d="M200 90 L216 99 L216 118 C216 128 200 134 200 134 C200 134 184 128 184 118 L184 99 Z"
                  fill="rgba(79,140,255,0.12)"
                  stroke="#4F8CFF"
                  strokeWidth="1"
                />
                <text
                  x="200"
                  y="117"
                  textAnchor="middle"
                  fill="#4F8CFF"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  ✓
                </text>

                {/* Right node */}
                <circle
                  cx="340"
                  cy="110"
                  r="24"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <circle cx="340" cy="110" r="8" fill="#10B981" />
                <text
                  x="340"
                  y="150"
                  textAnchor="middle"
                  fill="#6B7280"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  Receiver
                </text>

                {/* Animated data packets inside tunnel */}
                {[0, 1, 2].map((i) => (
                  <circle key={i} r="3" fill="#4F8CFF" opacity="0.7">
                    <animate
                      attributeName="cx"
                      from="115"
                      to="285"
                      dur="2.2s"
                      begin={`${i * 0.7}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values="110;108;112;110"
                      dur="2.2s"
                      begin={`${i * 0.7}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.7;0.7;0"
                      dur="2.2s"
                      begin={`${i * 0.7}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
