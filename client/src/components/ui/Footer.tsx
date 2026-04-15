import { Link } from "react-router-dom";

const links = [
  { label: "Home",      to: "/"          },
  { label: "Compare",   to: "/compare"   },
  { label: "Analytics", to: "/analytics" },
  { label: "History",   to: "/history"   },
];

export default function Footer() {
  return (
    <footer
      className="mt-20"
      style={{ borderTop: "1px solid rgba(70, 69, 84, 0.2)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">

        <div className="flex flex-col items-center md:items-start gap-2">
          <span
            className="headline text-lg font-bold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Job<span style={{ color: "var(--color-primary)" }}>Market</span>
          </span>
          <p
            className="text-xs label-precision uppercase tracking-wider"
            style={{ color: "var(--color-on-surface)", opacity: 0.4 }}
          >
            © 2024 JobMarket Analyzer. Final Year Project.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs label-precision uppercase tracking-wider transition-all duration-200"
              style={{ color: "var(--color-on-surface)", opacity: 0.5 }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = "1";
                (e.target as HTMLElement).style.color   = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = "0.5";
                (e.target as HTMLElement).style.color   = "var(--color-on-surface)";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </footer>
  );
}