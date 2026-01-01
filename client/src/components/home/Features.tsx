import { motion } from "framer-motion";
import { ServerOff, Zap, Lock, HardDrive, Activity, UserCheck } from "lucide-react";
import clsx from "clsx";

const features = [
  {
    title: "Direct P2P Transfer",
    desc: "Files move straight between browsers using WebRTC. Direct, fast, and private.",
    icon: Zap,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "No Server Storage",
    desc: "Files never touch a server. They stream directly from peer to peer.",
    icon: ServerOff,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Large File Support",
    desc: "Smart chunking and backpressure handling ensure stable transfers for files of any size.",
    icon: HardDrive,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "End-to-End Direct",
    desc: "Privacy by design. No middlemen, no tracking, just data flowing between two people.",
    icon: Lock,
    className: "md:col-span-1 md:row-span-2",
  },
  {
    title: "Real-Time Streaming",
    desc: "Start sending before the full file loads. Watch progress in real-time.",
    icon: Activity,
    className: "md:col-span-2 md:row-span-1",
  },
  {
    title: "Connection Manager",
    desc: "Accept or reject incoming requests. You are in control of who you connect with.",
    icon: UserCheck,
    className: "md:col-span-1 md:row-span-2", // Changed to row-span-2 to fill the grid
  },
];

export default function Features() {
  return (
    <section className="bg-gray-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
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
            Engineered for performance, privacy, and reliability. Peerly brings the power of WebRTC to your browser.
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-3"> {/* Removed fixed height */}
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-white/20",
                f.className
              )}
            >
              <div className="absolute right-0 top-0 -mr-4 -mt-4 h-32 w-32 bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20" />
              
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <f.icon size={24} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                  <p className="text-gray-400">{f.desc}</p>
                </div>
                
                {/* Visual flourishes based on index/type could go here */}
                {i === 0 && (
                   <div className="mt-4 flex gap-2 opacity-50">
                      <div className="h-2 w-full rounded-full bg-blue-500/30 animate-pulse" />
                      <div className="h-2 w-2/3 rounded-full bg-purple-500/30 animate-pulse delay-75" />
                   </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
