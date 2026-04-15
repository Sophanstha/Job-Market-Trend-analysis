import { FiArrowRight } from "react-icons/fi";
import { UseSearch } from "../../hooks/useSearch";
import TrendBadge from "./TrendBadge";

interface Props {
  title: string;
  category: string;
  demandScore: number;
  trend: "rising" | "declining" | "stable";
  topSkills: string[];
  similarity?: number;
  reason?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 85) return "var(--color-secondary)";
  if (score >= 70) return "var(--color-primary)";
  if (score >= 55) return "var(--color-tertiary)";
  return "var(--color-error)";
};

const JobCard = ({
  category,
  demandScore,
  title,
  trend,
  reason,
  topSkills,
  similarity,
}: Props) => {
  const { loading, search } = UseSearch();
  const scoreColor = getScoreColor(demandScore);

  return (
    <div
      onClick={() => search(category)}
      className="group relative p-6 rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: "var(--color-surface-container)",
        border: "1px solid var(--color-outline-variant)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
        el.style.borderColor = "rgba(192,193,255,0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "var(--color-outline-variant)";
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <h4
          className="font-bold text-lg leading-snug pr-3"
          style={{ color: "var(--color-on-surface)" }}
        >
          {title}
        </h4>

        <div
          className="text-xl font-extrabold"
          style={{ color: scoreColor }}
        >
          {similarity !== undefined ? `${similarity}%` : demandScore}
        </div>
      </div>

      {/* TREND */}
      <div className="mb-3">
        <TrendBadge trend={trend} sizes="sm" />
      </div>

      {/* REASON */}
      {reason && (
        <p
          className="text-sm mb-4 leading-relaxed line-clamp-2"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {reason}
        </p>
      )}

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {topSkills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: "var(--color-surface-container-high)",
              color: "var(--color-on-surface-variant)",
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div
        className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{ color: "var(--color-primary)" }}
      >
        {loading ? (
          <span>Searching...</span>
        ) : (
          <>
            <span>Analyze Career</span>
            <FiArrowRight size={14} />
          </>
        )}
      </div>

      {/* subtle glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition"
        style={{
          background:
            "radial-gradient(circle at top, rgba(192,193,255,0.08), transparent)",
        }}
      />
    </div>
  );
};

export default JobCard;