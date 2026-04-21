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
} from "react-icons/fi";
import type { CompareCategory } from "../../types";
import SkillTag from "../ui/SkillingTag";
import { useDispatch } from "react-redux";
import { useCompare } from "../../hooks/useCompare";
import { useAppSelector } from "../../store/hook";
import { setQueryA, setQueryB } from "../../store/slices/CompareSlice";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";

const MatricRow = ({
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
      className="grid grid-cols-3 py-4 items-center "
      style={{
        borderBottom: "1px solid var(--color-outline-variant)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 pr-4"
        style={{
          color: winnerA ? "var(--color-secondary)" : "var(--color-on-surface)",
        }}
      >
        <span className="label-precision text-base font-bold">{valueA}</span>
        {winnerA && (
          <FiAward size={14} style={{ color: "var(--color-secondary)" }} />
        )}
      </div>
      <div
        className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider label-precision"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="flex items-center gap-2 pl-4"
        style={{
          color: !winnerA
            ? "var(--color-secondary)"
            : "var(--color-on-surface)",
        }}
      >
        {!winnerA && (
          <FiAward size={14} style={{ color: "var(--color-secondary)" }} />
        )}
        <span className="label-precision text-base font-bold">{valueB}</span>
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
      className="rounded-2xl p-6 flex-1 overflow-hidden relative"
      style={{
        background: "var(--color-surface-container)",
        border: isWinner
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-outline-variant)",
      }}
    >
      {/* {winnerBage} */}
      {isWinner && (
        <div
          className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full font-bold uppercase tracking-wider label-precision"
          style={{
            background: "var(--color-primary-container)",
            color: "var(--color-primary)",
          }}
        >
          <FiAward size={11} />
          winner
        </div>
      )}
      {/* Side label */}
      <p
        className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Career {side}
      </p>
      {/* Title */}
      <h2
        className="headline text-xl font-extrabold tracking-tight mb-4"
        style={{ color: "var(--color-on-surface)" }}
      >
        {cat.title}
      </h2>
      {/* Big score */}
      <div className="flex items-end gap-3 mb-4">
        <span
          className="label-precision text-5xl font-black"
          style={{ color: scoreColor }}
        >
          {cat.demand.score}
        </span>
        <div className="pb-2">
          <p className="text-xs font-bold" style={{ color: scoreColor }}>
            {cat.demand.label}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Demand Score
          </p>
        </div>
      </div>
      {/* Trend */}
      <div className="flex items-center gap-2 mb-4">
        {cat.trend === "rising" ? (
          <FiTrendingUp size={14} style={{ color: "var(--color-secondary)" }} />
        ) : cat.trend === "declining" ? (
          <FiTrendingDown size={14} style={{ color: "var(--color-error)" }} />
        ) : (
          <FiMinus size={14} style={{ color: "var(--color-tertiary)" }} />
        )}
        <span
          className="text-sm font-medium capitalize"
          style={{
            color:
              cat.trend === "rising"
                ? "var(--color-secondary)"
                : cat.trend === "declining"
                  ? "var(--color-error)"
                  : "var(--color-tertiary)",
          }}
        >
          {cat.trend}
        </span>
      </div>
      {/* Top skills */}
      <div className="flex flex-wrap gap-2">
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
    if (!inputA.trim() || !inputB.trim()) {
      return;
    }
    dispatch(setQueryA(inputA));
    dispatch(setQueryB(inputB));
  };
  const handleKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCompare();
  };

  const comparsion = data?.comparison;
  const catA = comparsion?.categoryA;
  const catB = comparsion?.categoryB;
  const winner = comparsion?.winner;
  const differance = comparsion?.differences;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        {/* header */}
        <div className="mb-10">
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            Career Comparsion
          </p>
          <h1
            className="headline font-extrabold tracking-tighter mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Compare Any Two Careers
          </h1>
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Enter any two job titles, skills, or categories and get a
            side-by-side breakdown of demand, salary, growth, and remote
            availability.
          </p>
        </div>
        {/* search Inputs */}
        <div
          className="mb-10 rounded-2xl p-6"
          style={{ background: "var(--color-surface-container)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* inpuA */}
            <div>
              <label
                className="text-xs label-precision block uppercase font-bold tracking-wider mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Career A
              </label>
              <div className="relative">
                <FiSearch
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
                <input
                  type="text"
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  onKeyDown={handleKeyEnter}
                  placeholder="e.g. machine learning, ai, nurse..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface)",

                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "var(--color-primary)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(50,217,250,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-outline-variant)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
            {/* inputB */}
            <div>
              <label
                className="text-xs label-precision block uppercase font-bold tracking-wider mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Career B
              </label>
              <div className="relative">
                <FiSearch
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
                <input
                  type="text"
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  onKeyDown={handleKeyEnter}
                  placeholder="e.g. machine learning, ai, nurse..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface)",

                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "var(--color-primary)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(50,217,250,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--color-outline-variant)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleCompare}
            disabled={!inputA.trim() || !inputB.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {loading ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <FiArrowRight size={14} />
                Compare Careers
              </>
            )}
          </button>
        </div>
        {/* ── Error ──────────────────────────────────────────── */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onRetry={handleCompare} />
          </div>
        )}

        {/* ── Loading ────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Comparing careers..." />
          </div>
        )}
      </div>

      {/* compare result */}
      {comparsion && catA && catB && winner && differance && !loading && (
        <>
          {/* winner   */}
          <div
            className="rounded-2xl p-6 mb-8 flex items-center gap-4"
            style={{
              background: "var(--color-primary-container)",
              border: "1px solid var(--color-primary)",
            }}
          >
            <FiAward
              size={28}
              style={{ color: "var(--color-primary)", flexShrink: 0 }}
            />
            <div>
              <p
                className="label-precision text-xs font-bold uppercase tracking-widest  mb-1"
                style={{ color: "var(--color-primary)" }}
              >
                Overall Winner
              </p>
              <p
                className="headline font-extrabold text-xl"
                style={{ color: "var(--color-on-surface)" }}
              >
                {winner.overall}
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Based on demand score, growth rate, salary and remote
                availability
              </p>
            </div>
          </div>

          {/* compare cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 p-5">
            <CategoryCard
              cat={catA}
              side="A"
              isWinner={winner.overall === catA.title}
            />
            <div
              style={{ color: "var(--color-on-surface-variant)" }}
              className="hidden md:flex items-center justify-center text-2xl font-black flex-shrink-0"
            >
              VS
            </div>
            <CategoryCard
              cat={catB}
              side="B"
              isWinner={winner.overall === catB.title}
            />
          </div>
          {/* matric comparsion table */}
          <div
            className="rounded-2xl p-6 mb-8"
            style={{
              color: "var(--color-on-surface)",
            }}
          >
            <h3
              className="headline text-lg font-bold mb-6"
              style={{ color: "var(--color-on-surface)" }}
            >
              Head-to-Head Breakdown
            </h3>
            {/* Column headers */}
            <div
              className="grid grid-cols-3 pb-3 mb-2"
              style={{ borderBottom: "2px solid var(--color-outline)" }}
            >
              <p
                className="text-sm font-bold text-right pr-4 truncate"
                style={{ color: "var(--color-primary)" }}
              >
                {catA.title}
              </p>
              <p
                className="text-xs label-precision text-center uppercase tracking-widest"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Metric
              </p>
              <p
                className="text-sm font-bold pl-4 truncate"
                style={{ color: "var(--color-primary)" }}
              >
                {catB.title}
              </p>
            </div>
            {/* matric rows */}
            <MatricRow
              label="Demand Score"
              valueA={`${catA.demand.score}`}
              valueB={`${catB.demand.score}`}
              winnerA={catA.demand.score >= catB.demand.score}
              icon={<FiAward size={11} />}
            />
            <MatricRow
              label="Avg Salary"
              valueA={`$${(catA.averageSalary / 1000).toFixed(0)}k`}
              valueB={`$${(catB.averageSalary / 1000).toFixed(0)}k`}
              icon={<FiDollarSign size={11} />}
              winnerA={catA.averageSalary >= catB.averageSalary}
            />
              <MatricRow
                label="Growth Rate"
                valueA={`${catA.growthRate > 0 ? "+" : ""}${catA.growthRate}%`}
                valueB={`${catB.growthRate > 0 ? "+" : ""}${catB.growthRate}%`}
                winnerA={catA.growthRate >= catB.growthRate}
                icon={<FiTrendingUp size={11} />}
              />
              <MatricRow
                label="Job Openings"
                valueA={`${catA.jobOpenings.toLocaleString()}`}
                valueB={`${catB.jobOpenings.toLocaleString()}`}
                winnerA={catA.jobOpenings >= catB.jobOpenings}
                icon={<FiBriefcase size={11} />}
              />
                <MatricRow
                label="Remote Index"
                valueA={`${catA.remoteAvailability}%`}
                valueB={`${catB.remoteAvailability}%`}
                winnerA={catA.remoteAvailability >= catB.remoteAvailability}
                icon={<FiWifi size={11} />}
              />
              <MatricRow
                label="Entry Salary"
                valueA={`$${(catA.entryLevelSalary / 1000).toFixed(0)}k`}
                valueB={`$${(catB.entryLevelSalary / 1000).toFixed(0)}k`}
                winnerA={catA.entryLevelSalary >= catB.entryLevelSalary}
                icon={<FiDollarSign size={11} />}
              />
              <MatricRow
                label="Senior Salary"
                valueA={`$${(catA.seniorLevelSalary / 1000).toFixed(0)}k`}
                valueB={`$${(catB.seniorLevelSalary / 1000).toFixed(0)}k`}
                winnerA={catA.seniorLevelSalary >= catB.seniorLevelSalary}
                icon={<FiDollarSign size={11} />}
              />
          </div>
          {/* Differences summary */}
          <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {
              [
                {
                  label: "Salary Difference",
                  value: `$${(differance.salaryDiff / 1000).toFixed(0)}k`,
                  color: "var(--color-primary)",
                },
                {
                  label: "Growth Difference",
                  value: `${differance.growthDiff}%`,
                  color: "var(--color-secondary)",
                },
                {
                  label: "Demand Difference",
                  value: `${differance.demandDiff} pts`,
                  color: "var(--color-tertiary)",
                },
                {
                  label: "Remote Difference",
                  value: `${differance.remoteDiff}%`,
                  color: "var(--color-on-surface-variant)",
                },
              ].map((d)=>(
                   <div
                  key={d.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: "var(--color-surface-container)" }}
                >
                  <p
                    className="label-precision text-2xl font-black mb-1"
                    style={{ color: d.color }}
                  >
                    {d.value}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {d.label}
                  </p>
                </div>
              ))
            }
          </div>

            {/* Skills comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <h3
                  className="headline text-base font-bold mb-4"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {catA.title} — Top Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catA.topSkills.map((sk) => (
                    <SkillTag key={sk} skill={sk} variant="primary" />
                  ))}
                </div>
              </div>
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <h3
                  className="headline text-base font-bold mb-4"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {catB.title} — Top Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {catB.topSkills.map((sk) => (
                    <SkillTag key={sk} skill={sk} variant="secondary" />
                  ))}
                </div>
              </div>
            </div>
          
        </>
      )}

         {/* ── Empty state ─────────────────────────────────────── */}
        {!comparsion && !loading && !error && (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "var(--color-surface-container)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-surface-container-high)" }}
            >
              <FiArrowRight
                size={24}
                style={{ color: "var(--color-primary)" }}
              />
            </div>
            <h3
              className="headline text-xl font-bold mb-2"
              style={{ color: "var(--color-on-surface)" }}
            >
              Enter two careers to compare
            </h3>
            <p
              className="text-sm max-w-sm mx-auto"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Type any two job titles, skills, or categories in the fields
              above and click Compare Careers.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
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
                  className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color:      "var(--color-on-surface-variant)",
                    border:     "1px solid var(--color-outline-variant)",
                  }}
                >
                  {a} vs {b}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default Compare;
