export default function Technology() {
    return (
      <section className="bg-black py-24 text-center text-white">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
            Under the Hood
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
            <p className="text-lg leading-relaxed text-gray-300">
              Peerly uses <span className="text-blue-400 font-medium">WebSockets</span> purely for signaling and peer discovery. 
              Once connected, all file data flows directly between peers using <span className="text-purple-400 font-medium">WebRTC DataChannels</span>.
              There is <span className="text-white font-semibold">no server-side file handling or storage</span>.
            </p>
          </div>
        </div>
      </section>
    );
  }
