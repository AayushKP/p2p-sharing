import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" id="nav-logo" className="text-xl font-bold tracking-tight text-white">
          Peerly
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            id="nav-how-it-works"
            className="hidden text-sm font-medium text-gray-400 transition hover:text-white md:block"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it works
          </a>
          <Link
            to="/app"
            id="nav-start-sharing"
            className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            Start Sharing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
