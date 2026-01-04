import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Peerly</span>
          <span className="text-sm text-gray-500">© 2025</span>
        </div>

        <div className="flex gap-8 text-sm text-gray-400">
          <a
            href="#"
            id="footer-privacy"
            className="hover:text-white transition"
          >
            Privacy
          </a>
          <a href="#" id="footer-terms" className="hover:text-white transition">
            Terms
          </a>
          <a
            href="https://github.com/AayushKP/p2p-sharing"
            id="footer-github"
            className="hover:text-white transition"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="mb-6 text-3xl font-bold">
          Start sharing, the direct way.
        </h2>
        <Link
          to="/app"
          id="footer-cta-launch"
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          Launch App
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  );
}
