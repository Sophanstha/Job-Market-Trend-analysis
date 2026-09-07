import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "../ui/LoadingSpinner";
import {
  FiArrowLeft,
  FiBriefcase,
  FiDollarSign,
  FiTrendingUp,
  FiWifi,
} from "react-icons/fi";
import ErrorMessage from "../ui/ErrorMessage";
import DemandRing from "../ui/DemandRing";
import TrendBadge from "../ui/TrendBadge";
// import { useAppSelector } from "../../store/hooks";
import MarketForecast from "../ui/forcastChart";
import { UseSearch } from "../../hooks/useSearch";
import { useAppSelector } from "../../store/hook";
import ScoreBar from "../ui/ScoreBar";
import SkillTag from "../ui/SkillingTag";


const SearchResults = () => {
  const navigate = useNavigate();
  const { error, loading } = UseSearch();
  const { query, data } = useAppSelector((s) => s.search);

  useEffect(() => {
    if (!data && !loading) {
      navigate("/");
    }
  }, [loading, data, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-background)" }}
      >
        <LoadingSpinner size="lg" text="Analyzing job market data..." />
      </div>
    );
  }
  if (!data) return null;

  const { result, recommendations, otherMatches } = data;
  const { job, demand, forecast } = result;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--color-background)",
      }}
    >
      <div className="max-w-screen-xl mx-auto py-10 px-6">
        {/* back button and query header */}
        <div className="mb-15">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ color: "var(--color-on-surface-variant)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--color-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--color-on-surface-variant)")
            }
          >
            <FiArrowLeft size={14} />
            Back to search
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span
              className="label-precision text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--color-primary)" }}
            >
              Search Result
            </span>
            <div
              className="h-px w-8"
              style={{ background: "var(--color-outline)" }}
            />
            <span
              className="text-sm"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {job.title}
            </span>
          </div>
          <h1
            className="headline font-extrabold tracking-tighter leading-none"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              color: "var(--color-on-surface)",
            }}
          >
            {query}
          </h1>
        </div>

        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} />
          </div>
        )}
{/* ── Demand ring + Market Forecast side by side ───────── */}
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

  {/* Demand ring card */}
  <div
    className="md:col-span-4 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
    style={{ background: "var(--color-surface-container)" }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(50,217,250,0.05), transparent 70%)",
      }}
    />
    <div className="relative z-10 mb-4">
      <DemandRing score={demand.score} size={180} />
    </div>
    <TrendBadge trend={job.trend} />
    <p
      className="text-xs text-center mt-3 leading-relaxed max-w-md"
      style={{ color: "var(--color-on-surface-variant)" }}
    >
      {demand.interpretation}
    </p>
  </div>

  {/* Market Forecast — Present vs Future */}
  {forecast && (
    <div className="md:col-span-8">
      <MarketForecast forecast={forecast} jobTitle={job.title} />
    </div>
  )}
</div>

        {/* ── Stat cards row ──────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Median Salary",
              value: `$${(job.averageSalary / 1000).toFixed(0)}k`,
              subtext: "Per year USD",
              icon: <FiDollarSign size={11} />,
              accent: "primary" as const,
            },
            {
              label: "Growth Rate",
              value: `${job.growthRate > 0 ? "+" : ""}${job.growthRate}%`,
              subtext:
                job.growthRate > 20
                  ? "Explosive growth"
                  : job.growthRate > 0
                    ? "Steady growth"
                    : "Declining",
              icon: <FiTrendingUp size={11} />,
              accent: "secondary" as const,
            },
            {
              label: "Job Openings",
              value:
                job.jobOpenings >= 1000000
                  ? `${(job.jobOpenings / 1000000).toFixed(1)}M`
                  : `${(job.jobOpenings / 1000).toFixed(0)}k`,
              subtext: "Global market",
              icon: <FiBriefcase size={11} />,
              accent: "tertiary" as const,
            },
            {
              label: "Remote Index",
              value: `${job.remoteAvailability}%`,
              subtext:
                job.remoteAvailability >= 70
                  ? "High flexibility"
                  : "Mostly on-site",
              icon: <FiWifi size={11} />,
              accent: "error" as const,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-6"
              style={{
                background: "var(--color-surface-container)",
                borderLeft: `4px solid var(--color-${stat.accent})`,
              }}
            >
              <p
                className="label-precision text-[10px] uppercase tracking-widest mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                {stat.label}
              </p>
              <h4
                className="label-precision text-3xl font-bold mb-2"
                style={{ color: "var(--color-on-surface)" }}
              >
                {stat.value}
              </h4>
              <p
                className="text-[10px] flex items-center gap-1 font-medium"
                style={{ color: `var(--color-${stat.accent})` }}
              >
                {stat.icon}
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* ── Score breakdown + Skills ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--color-surface-container)" }}
          >
            <h3
              className="headline text-lg font-bold mb-6"
              style={{ color: "var(--color-on-surface)" }}
            >
              Score Breakdown
            </h3>
            <div className="space-y-5">
              <ScoreBar
                label="Growth Potential"
                score={demand.breakdown.growthScore}
                color="var(--color-primary)"
              />
              <ScoreBar
                label="Job Availability"
                score={demand.breakdown.openingsScore}
                color="var(--color-secondary)"
              />
              <ScoreBar
                label="Salary Premium"
                score={demand.breakdown.salaryScore}
                color="var(--color-tertiary)"
              />
              <ScoreBar
                label="Remote Feasibility"
                score={demand.breakdown.remoteScore}
                color="var(--color-on-surface-variant)"
              />
            </div>
          </div>

          {/* skill + role + industry */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "var(--color-surface-container)" }}
          >
            <h3
              className="headline text-lg font-bold mb-4"
              style={{ color: "var(--color-on-surface)" }}
            >
              Top Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {job.topSkills.map((skill) => (
                <SkillTag key={skill} skill={skill} variant="primary" />
              ))}
            </div>

            <h3
              className="headline text-base font-bold mb-3"
              style={{ color: "var(--color-on-surface)" }}
            >
              Industries
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.industries.map((ind) => (
                <SkillTag key={ind} skill={ind} />
              ))}
            </div>
          </div>
        </div>

        {/* summary */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{
            background: "var(--color-surface-container)",
            borderLeft: "4px solid var(--color-primary)",
          }}
        >
          <p
            className="label-precision text-xs uppercase tracking-widest mb-3 font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            Market Summary
          </p>
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {job.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span style={{ color: "var(--color-on-surface-variant)" }}>
              Education:{" "}
              <span style={{ color: "var(--color-on-surface)" }}>
                {job.education}
              </span>
            </span>
            <span style={{ color: "var(--color-on-surface-variant)" }}>
              Entry Level:{" "}
              <span style={{ color: "var(--color-secondary)" }}>
                ${(job.entryLevelSalary / 1000).toFixed(0)}k
              </span>
            </span>
            <span style={{ color: "var(--color-on-surface-variant)" }}>
              Senior Level:{" "}
              <span style={{ color: "var(--color-primary)" }}>
                ${(job.seniorLevelSalary / 1000).toFixed(0)}k
              </span>
            </span>
          </div>
        </div>

        {/* ── Other matches ───────────────────────────────────── */}
        {otherMatches && otherMatches.length > 0 && (
          <div className="mb-8">
            <h3
              className="headline text-lg font-bold mb-4"
              style={{ color: "var(--color-on-surface)" }}
            >
              Other Matches
            </h3>
            <div className="flex flex-wrap gap-3">
              {otherMatches.map((match) => (
                <button
                  key={match.category}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: "var(--color-surface-container)",
                    color: "var(--color-on-surface-variant)",
                    border: "1px solid var(--color-outline)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-primary)";
                    el.style.color = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--color-outline)";
                    el.style.color = "var(--color-on-surface-variant)";
                  }}
                >
                  {match.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendations ─────────────────────────────────── */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h3
                className="headline text-2xl font-bold"
                style={{ color: "var(--color-on-surface)" }}
              >
                Career Recommendations
              </h3>
              <div
                className="h-px flex-grow"
                style={{ background: "var(--color-outline)" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <div
                  key={rec.category}
                  className="rounded-2xl p-6"
                  style={{ background: "var(--color-surface-container)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className="font-bold text-sm"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {rec.title}
                    </h4>
                    <span
                      className="label-precision text-lg font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {rec.demandScore}
                    </span>
                  </div>
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {rec.reason}
                  </p>
                  <p
                    className="label-precision text-[10px] font-bold"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {rec.similarityScore}% similar
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;