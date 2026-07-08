import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link to="/" className="text-[15px] font-semibold text-white">
              Peerly
            </Link>
            <span className="text-xs text-subtle">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-[13px] text-subtle">
            <a
              href="#"
              id="footer-privacy"
              className="transition-colors hover:text-muted"
            >
              Privacy
            </a>
            <a
              href="#"
              id="footer-terms"
              className="transition-colors hover:text-muted"
            >
              Terms
            </a>
            <a
              href="https://github.com/AayushKP/p2p-sharing"
              id="footer-github"
              className="transition-colors hover:text-muted"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>

          {/* CTA */}
          <Link
            to="/app"
            id="footer-cta-launch"
            className="text-[13px] font-medium text-accent transition-colors hover:text-white"
          >
            Launch App →
          </Link>
        </div>
      </div>
    </footer>
  );
}
