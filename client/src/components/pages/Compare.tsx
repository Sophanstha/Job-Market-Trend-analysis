import React, { useState } from "react";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiDollarSign,
  FiMinus,
  FiSearch,
  FiTrendingDown,
  FiTrendingUp,
  FiWifi,
  FiZap,
} from "react-icons/fi";
import type { CompareCategory } from "../../types";
import SkillTag from "../ui/SkillingTag";
import { useDispatch } from "react-redux";
import { useCompare } from "../../hooks/useCompare";
import { useAppSelector } from "../../store/hook";
import { setQueryA, setQueryB } from "../../store/slices/CompareSlice";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";

const MetricRow = ({
  label,
  valueA,
  valueB,
  winnerA,
  icon,
}: {
  label: string;
  valueA: string;
  valueB: string;
  winnerA: boolean;
  icon: React.ReactNode;
}) => {
  return (
    <div
      className="grid grid-cols-3 py-4 items-center transition-colors hover:bg-[var(--color-surface-container-high)]/50 px-3 rounded-lg"
      style={{
        borderBottom: "1px solid var(--color-outline-variant)",
      }}
    >
      <div
        className="flex items-center justify-start md:justify-end gap-2 pr-2 md:pr-4"
        style={{
          color: winnerA ? "var(--color-secondary)" : "var(--color-on-surface)",
        }}
      >
        <span className="label-precision text-sm md:text-base font-bold">{valueA}</span>
        {winnerA && (
          <FiAward size={14} className="shrink-0" style={{ color: "var(--color-secondary)" }} />
        )}
      </div>

      <div
        className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider label-precision font-semibold"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>

      <div
        className="flex items-center justify-end md:justify-start gap-2 pl-2 md:pl-4"
        style={{
          color: !winnerA
            ? "var(--color-secondary)"
            : "var(--color-on-surface)",
        }}
      >
        {!winnerA && (
          <FiAward size={14} className="shrink-0" style={{ color: "var(--color-secondary)" }} />
        )}
        <span className="label-precision text-sm md:text-base font-bold">{valueB}</span>
      </div>
    </div>
  );
};

const CategoryCard = ({
  cat,
  side,
  isWinner,
}: {
  cat: CompareCategory;
  side: "A" | "B";
  isWinner: boolean;
}) => {
  const scoreColor =
    cat.demand.score >= 70
      ? "var(--color-primary)"
      : cat.demand.score >= 55
        ? "var(--color-primary)"
        : cat.demand.score >= 35
          ? "var(--color-tertiary)"
          : "var(--color-error)";

  return (
    <div
      className="rounded-2xl p-6 flex-1 overflow-hidden relative transition-all duration-300 hover:shadow-lg"
      style={{
        background: "var(--color-surface-container)",
        border: isWinner
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-outline-variant)",
      }}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider label-precision shadow-sm"
          style={{
            background: "var(--color-primary-container)",
            color: "var(--color-primary)",
          }}
        >
          <FiAward size={13} />
          Winner
        </div>
      )}

      {/* Side Label */}
      <p
        className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Career {side}
      </p>

      {/* Title */}
      <h2
        className="headline text-2xl font-extrabold tracking-tight mb-4 capitalize"
        style={{ color: "var(--color-on-surface)" }}
      >
        {cat.title}
      </h2>

      {/* Demand Score */}
      <div className="flex items-end gap-3 mb-5">
        <span
          className="label-precision text-5xl font-black leading-none"
          style={{ color: scoreColor }}
        >
          {cat.demand.score}
        </span>
        <div>
          <p className="text-xs font-bold capitalize" style={{ color: scoreColor }}>
            {cat.demand.label}
          </p>
          <p
            className="text-xs uppercase tracking-wider font-medium"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Demand Score
          </p>
        </div>
      </div>

      {/* Growth Trend */}
      <div className="flex items-center gap-2 mb-6">
        {cat.trend === "rising" ? (
          <FiTrendingUp size={16} style={{ color: "var(--color-secondary)" }} />
        ) : cat.trend === "declining" ? (
          <FiTrendingDown size={16} style={{ color: "var(--color-error)" }} />
        ) : (
          <FiMinus size={16} style={{ color: "var(--color-tertiary)" }} />
        )}
        <span
          className="text-sm font-semibold capitalize"
          style={{
            color:
              cat.trend === "rising"
                ? "var(--color-secondary)"
                : cat.trend === "declining"
                  ? "var(--color-error)"
                  : "var(--color-tertiary)",
          }}
        >
          {cat.trend} Market Demand
        </span>
      </div>

      {/* Top Skills Preview */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-outline-variant)]">
        {cat.topSkills.slice(0, 4).map((sk) => (
          <SkillTag key={sk} skill={sk} />
        ))}
      </div>
    </div>
  );
};

const Compare = () => {
  const dispatch = useDispatch();
  const { data, error, loading } = useCompare();
  const { queryA, queryB } = useAppSelector((cm) => cm.compare);

  const [inputA, setInputA] = useState(queryA);
  const [inputB, setInputB] = useState(queryB);

  const handleCompare = () => {
    if (!inputA.trim() || !inputB.trim()) return;
    dispatch(setQueryA(inputA));
    dispatch(setQueryB(inputB));
  };

  const handleKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCompare();
  };

  const comparison = data?.comparison;
  const catA = comparison?.categoryA;
  const catB = comparison?.categoryB;
  const winner = comparison?.winner;
  const difference = comparison?.differences;

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: "var(--color-background)" }}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-10">
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            Career Intelligence
          </p>
          <h1
            className="headline font-black tracking-tight mb-3"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Side-by-Side Comparison
          </h1>
          <p
            className="text-sm md:text-base max-w-2xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Evaluate market demand, median compensation, projected growth, and remote flexibility across industry roles.
          </p>
        </div>

        {/* Input Bar Card */}
        <div
          className="mb-10 rounded-2xl p-6 shadow-sm border border-[var(--color-outline-variant)]"
          style={{ background: "var(--color-surface-container)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Input A */}
            <div>
              <label
                className="text-xs label-precision block uppercase font-bold tracking-wider mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Career Option A
              </label>
              <div className="relative">
                <FiSearch
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
                <input
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  onKeyDown={handleKeyEnter}
                  placeholder="e.g. Machine Learning, Mobile Developer..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all font-medium"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(50,217,250,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Input B */}
            <div>
              <label
                className="text-xs label-precision block uppercase font-bold tracking-wider mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Career Option B
              </label>
              <div className="relative">
                <FiSearch
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
                <input
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  onKeyDown={handleKeyEnter}
                  placeholder="e.g. Data Scientist, Cloud Architect..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all font-medium"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(50,217,250,0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-outline-variant)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={!inputA.trim() || !inputB.trim() || loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {loading ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <FiArrowRight size={16} />
                Compare Careers
              </>
            )}
          </button>
        </div>

        {/* States: Error & Loading */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={handleCompare} />
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Analyzing market analytics..." />
          </div>
        )}

        {/* Results Container */}
        {comparison && catA && catB && winner && difference && !loading && (
          <div className="space-y-8 animate-fade-in">
            {/* Overall Winner Card */}
            <div
              className="rounded-2xl p-6 flex items-start sm:items-center gap-4 shadow-sm"
              style={{
                background: "var(--color-primary-container)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <div 
                className="p-3 rounded-xl shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <FiAward size={32} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p
                  className="label-precision text-xs font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "var(--color-primary)" }}
                >
                  Market Advantage Winner
                </p>
                <p
                  className="headline font-black text-2xl capitalize"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {winner.overall}
                </p>
                <p
                  className="text-xs sm:text-sm mt-1 font-medium"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Outperforms across combined demand rating, trajectory growth, total yield, and remote accessibility.
                </p>
              </div>
            </div>

            {/* Category Cards side-by-side */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              <CategoryCard
                cat={catA}
                side="A"
                isWinner={winner.overall === catA.title}
              />
              <div
                style={{ color: "var(--color-on-surface-variant)" }}
                className="hidden md:flex items-center justify-center text-xl font-black shrink-0 px-2"
              >
                VS
              </div>
              <CategoryCard
                cat={catB}
                side="B"
                isWinner={winner.overall === catB.title}
              />
            </div>

            {/* Metrics Table */}
            <div
              className="rounded-2xl p-6 border border-[var(--color-outline-variant)] shadow-sm"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
              }}
            >
              <h3
                className="headline text-lg font-bold mb-6 flex items-center gap-2"
                style={{ color: "var(--color-on-surface)" }}
              >
                <FiZap size={18} style={{ color: "var(--color-primary)" }} />
                Head-to-Head Breakdown
              </h3>

              {/* Table Header */}
              <div
                className="grid grid-cols-3 pb-3 mb-2 font-bold"
                style={{ borderBottom: "2px solid var(--color-outline-variant)" }}
              >
                <p
                  className="text-sm text-left md:text-right pr-2 md:pr-4 truncate uppercase tracking-wider"
                  style={{ color: "var(--color-primary)" }}
                >
                  {catA.title}
                </p>
                <p
                  className="text-xs label-precision text-center uppercase tracking-widest my-auto"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Metric
                </p>
                <p
                  className="text-sm text-right md:text-left pl-2 md:pl-4 truncate uppercase tracking-wider"
                  style={{ color: "var(--color-primary)" }}
                >
                  {catB.title}
                </p>
              </div>

              {/* Metric Rows */}
              <div className="space-y-1">
                <MetricRow
                  label="Demand Score"
                  valueA={`${catA.demand.score}`}
                  valueB={`${catB.demand.score}`}
                  winnerA={catA.demand.score >= catB.demand.score}
                  icon={<FiAward size={13} />}
                />
                <MetricRow
                  label="Avg Salary"
                  valueA={`$${(catA.averageSalary / 1000).toFixed(0)}k`}
                  valueB={`$${(catB.averageSalary / 1000).toFixed(0)}k`}
                  icon={<FiDollarSign size={13} />}
                  winnerA={catA.averageSalary >= catB.averageSalary}
                />
                <MetricRow
                  label="Growth Rate"
                  valueA={`${catA.growthRate > 0 ? "+" : ""}${catA.growthRate}%`}
                  valueB={`${catB.growthRate > 0 ? "+" : ""}${catB.growthRate}%`}
                  winnerA={catA.growthRate >= catB.growthRate}
                  icon={<FiTrendingUp size={13} />}
                />
                <MetricRow
                  label="Job Openings"
                  valueA={`${catA.jobOpenings.toLocaleString()}`}
                  valueB={`${catB.jobOpenings.toLocaleString()}`}
                  winnerA={catA.jobOpenings >= catB.jobOpenings}
                  icon={<FiBriefcase size={13} />}
                />
                <MetricRow
                  label="Remote Index"
                  valueA={`${catA.remoteAvailability}%`}
                  valueB={`${catB.remoteAvailability}%`}
                  winnerA={catA.remoteAvailability >= catB.remoteAvailability}
                  icon={<FiWifi size={13} />}
                />
                <MetricRow
                  label="Entry Salary"
                  valueA={`$${(catA.entryLevelSalary / 1000).toFixed(0)}k`}
                  valueB={`$${(catB.entryLevelSalary / 1000).toFixed(0)}k`}
                  winnerA={catA.entryLevelSalary >= catB.entryLevelSalary}
                  icon={<FiDollarSign size={13} />}
                />
                <MetricRow
                  label="Senior Salary"
                  valueA={`$${(catA.seniorLevelSalary / 1000).toFixed(0)}k`}
                  valueB={`$${(catB.seniorLevelSalary / 1000).toFixed(0)}k`}
                  winnerA={catA.seniorLevelSalary >= catB.seniorLevelSalary}
                  icon={<FiDollarSign size={13} />}
                />
              </div>
            </div>

            {/* Differences Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Salary Delta",
                  value: `$${(difference.salaryDiff / 1000).toFixed(0)}k`,
                  color: "var(--color-primary)",
                },
                {
                  label: "Growth Gap",
                  value: `${difference.growthDiff}%`,
                  color: "var(--color-secondary)",
                },
                {
                  label: "Demand Variance",
                  value: `${difference.demandDiff} pts`,
                  color: "var(--color-tertiary)",
                },
                {
                  label: "Remote Spread",
                  value: `${difference.remoteDiff}%`,
                  color: "var(--color-on-surface-variant)",
                },
              ].map((d) => (
                <div
                  key={d.label}
                  className="rounded-2xl p-5 text-center border border-[var(--color-outline-variant)] shadow-sm"
                  style={{ background: "var(--color-surface-container)" }}
                >
                  <p
                    className="label-precision text-2xl md:text-3xl font-black mb-1"
                    style={{ color: d.color }}
                  >
                    {d.value}
                  </p>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {d.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Skills Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-6 border border-[var(--color-outline-variant)]"
                style={{ background: "var(--color-surface-container)" }}
              >
                <h3
                  className="headline text-base font-bold mb-4 capitalize"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {catA.title} — Key Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catA.topSkills.map((sk) => (
                    <SkillTag key={sk} skill={sk} variant="primary" />
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-6 border border-[var(--color-outline-variant)]"
                style={{ background: "var(--color-surface-container)" }}
              >
                <h3
                  className="headline text-base font-bold mb-4 capitalize"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {catB.title} — Key Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catB.topSkills.map((sk) => (
                    <SkillTag key={sk} skill={sk} variant="secondary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparison && !loading && !error && (
          <div
            className="rounded-2xl p-12 md:p-16 text-center border border-[var(--color-outline-variant)] shadow-sm"
            style={{ background: "var(--color-surface-container)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
              style={{ background: "var(--color-surface-container-high)" }}
            >
              <FiArrowRight
                size={24}
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <h3
              className="headline text-xl md:text-2xl font-bold mb-2"
              style={{ color: "var(--color-on-surface)" }}
            >
              Select Two Careers to Compare
            </h3>
            <p
              className="text-sm max-w-md mx-auto mb-6"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Choose popular tech and domain specializations to generate instant head-to-head metrics.
            </p>

            <div className="flex flex-wrap justify-center gap-2.5 max-w-xl mx-auto">
              {[
                ["ai", "cybersecurity"],
                ["software", "data"],
                ["cloud", "blockchain"],
                ["healthcare", "finance"],
              ].map(([a, b]) => (
                <button
                  key={`${a}-${b}`}
                  onClick={() => {
                    setInputA(a);
                    setInputB(b);
                    dispatch(setQueryA(a));
                    dispatch(setQueryB(b));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface-variant)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  {a} <span className="opacity-50">vs</span> {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;