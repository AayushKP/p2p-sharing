import { motion } from "framer-motion";
import {
  ServerOff,
  Zap,
  Lock,
  HardDrive,
  Activity,
  UserCheck,
} from "lucide-react";
import clsx from "clsx";

const features = [
  {
    title: "Direct P2P Transfer",
    desc: "Files move straight between browsers using WebRTC. No server storage involved.",
    icon: Zap,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "No Server Storage",
    desc: "Files never touch a server. Data streams directly from peer to peer.",
    icon: ServerOff,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Large File Support",
    desc: "Chunked streaming and backpressure handling for stable transfers.",
    icon: HardDrive,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Direct Connection",
    desc: "No middlemen. Data flows directly between two peers.",
    icon: Lock,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Connection Manager",
    desc: "Accept or reject incoming requests. You stay in control.",
    icon: UserCheck,
    className: "md:col-span-1 md:row-span-1",
  },
  {
  title: "Real-Time Streaming",
  desc: "Begin transferring instantly while the file is still loading. Data is streamed in chunks with live progress updates, reducing wait time and improving transfer reliability.",
  icon: Activity,
  className: "md:col-span-4 md:row-span-1",
}

];

export default function Features() {
  return (
    <section className="bg-gray-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-16 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold tracking-tight md:text-5xl"
          >
            More than just file sharing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-400"
          >
            Built for speed and simplicity. Peerly enables direct browser-to-browser
            file transfers using WebRTC.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[18rem]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className={clsx(
                "group relative flex h-full flex-col justify-between overflow-hidden",
                "rounded-3xl border border-white/10 bg-white/5 p-8",
                "transition-all hover:bg-white/10 hover:border-white/20",
                f.className
              )}
            >
              {/* Glow */}
              <div className="absolute -right-10 -top-10 h-40 w-40 bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20" />

              {/* Content */}
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 transition-transform group-hover:scale-110">
                  <f.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>

              {/* Progress animation only for hero card */}
              {i === 0 && (
                <div className="relative z-10 mt-6 flex gap-2 opacity-60">
                  <div className="h-2 w-full rounded-full bg-blue-500/30 animate-pulse" />
                  <div className="h-2 w-2/3 rounded-full bg-purple-500/30 animate-pulse delay-75" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
