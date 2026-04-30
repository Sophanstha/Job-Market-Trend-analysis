import React, { useRef, useState } from "react";
import { useResumeAnalysis } from "../../hooks/useResumeAnalysis";
import { UseSearch } from "../../hooks/useSearch";
import { retry } from "@reduxjs/toolkit/query";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiFile,
  FiTrendingUp,
  FiUpload,
  FiWifi,
  FiX,
} from "react-icons/fi";
import LoadingSpinner from "../ui/LoadingSpinner";
import ScoreBar from "../ui/ScoreBar";
import TrendBadge from "../ui/TrendBadge";
import SkillTag from "../ui/SkillingTag";
import JobCard from "../ui/JobCard";

const scoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference * (1 - score / 100);

  const color =
    score >= 70
      ? "#30D158"
      : score >= 50
        ? "#32D9FA"
        : score >= 35
          ? "#FF9F0A"
          : "#FF453A";
  return (
    <div className="relative w-36 h-26">
      <svg
        width="144"
        height="144"
        viewBox="0 0 144 144"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="72"
          cy="72"
          r="54"
          fill="none"
          stroke="#2C2C2E"
          strokeWidth="10"
        />
        <circle
          cx="72"
          cy="72"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="label-precision text-3xl font-black" style={{ color }}>
          {score}
        </span>
        <span
          className="label-precision text-[9px] uppercase tracking-widest"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Resume Score
        </span>
      </div>
    </div>
  );
};
const Resume = () => {
  const { analysis, data, error, loading, reset } = useResumeAnalysis();
  const fileRef = useRef<HTMLInputElement>(null);
  const { search } = UseSearch();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleSelectFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      return;
    }
    setSelectedFile(file);
  };
  const hadleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleSelectFile(file);
  };
  const handlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (files) handleSelectFile(files);
  };
  const handleAnalyis = () => {
    if (!selectedFile) return;
    analysis(selectedFile);
  };
  const handleReset = () => {
    reset();
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const matched = data?.matchedCategory;

  const scoreColor =
    matched && matched.demandScore >= 65
      ? "var(--color-secondary)"
      : matched && matched.demandScore >= 50
        ? "var(--color-primary)"
        : matched && matched.demandScore >= 38
          ? "var(--color-tertiary)"
          : "var(--color-error)";

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            AI-Powered
          </p>
          <h1
            className="headline font-extrabold tracking-tighter mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Resume Analyzer
          </h1>
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Upload your PDF resume — our system extracts your skills, matches
            you to the best career category, calculates your demand score, and
            shows exactly what skills you need to add.
          </p>
        </div>
        {/* uplaod section */}
        {!data && (
          <div className="max-w-2xl">
            <div
              className="rounded-2xl cursor-pointer p-12 transition-all duration-200 mb-6 text-center"
              style={{
                background: dragOver
                  ? "var(--color-surface-container-high)"
                  : "var(--color-surface-container)",
                border: `2px dashed ${
                  dragOver ? "var(--color-primary)" : "var(--color-outline)"
                }`,
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={hadleDrag}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlInputChange}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--color-primary-container)" }}
                  >
                    <FiFile
                      size={24}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <p className="font-bold text-sm">{selectedFile.name}</p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {(selectedFile.size / 1024).toFixed(0)} KB · PDF
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: "var(--color-surface-container-high)",
                    }}
                  >
                    <FiUpload
                      size={28}
                      style={{ color: "var(--color-primary)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="headline text-lg font-bold mb-1"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      Drop your resume here
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      or click to browse — PDF only, max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 flex items-center gap-3 mb-4"
            style={{
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)",
            }}
          >
            <FiAlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {/* {action button} */}
        <div className="flex gap-3">
          <button
            onClick={handleAnalyis}
            disabled={!selectedFile || loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Analyzing...
              </>
            ) : (
              <>
                <FiUpload size={15} />
                Analyze Resume
              </>
            )}
          </button>
          {selectedFile && !loading && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              <FiX size={15} />
              Clear
            </button>
          )}
        </div>
      </div>
      {/* result data */}
      {data && matched && (
        <div className="p-7">
          {/* Reset button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm mb-8 ml-2 transition-colors"
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
            <FiX size={14} />
            Analyze another resume
          </button>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* resumme score ring */}
            <div
              className="md:col-span-4 rounded-xl p-8 flex flex-col items-center justify-center"
              style={{ background: "var(--color-surface-container)" }}
            >
              <ScoreBar score={data.resumeScore} />
              <div className="text-center">
                <p
                  className="headline text-xl font-bold mb-1"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {data.resumeScore >= 70
                    ? "Strong Profile"
                    : data.resumeScore >= 50
                      ? "Good Profile"
                      : data.resumeScore >= 35
                        ? "Developing Profile"
                        : "Needs Improvement"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Based on skills, match quality and market demand
                </p>
              </div>
            </div>
            {/* bext carrer match */}
            <div
              className="col-span-8 rounded-2xl p-8"
              style={{ background: "var(--color-surface-container)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <p
                  className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-primary)" }}
                >
                  Best Career Match
                </p>
                <h2
                  className="headline text-2xl font-extrabold tracking-tight"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {matched.title}
                </h2>
              </div>
              <TrendBadge
                trend={matched.trend as "rising" | "declining" | "stable"}
              />
            </div>
            {/* Match score bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs label-precision mb-2">
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  Skill Match
                </span>
                <span style={{ color: scoreColor }}>{matched.matchScore}%</span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-container-high)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${matched.matchScore}%`,
                    background: scoreColor,
                  }}
                />
              </div>
            </div>
          </div>
          {/*4 state cards  */}
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                label: "Demand Score",
                value: `${matched.demandScore} %`,
                icon: <FiBriefcase size={12} />,
                accent: scoreColor,
              },
              {
                label: "Average Salary",
                value: `$${(matched.averageSalary / 1000).toFixed()}`,
                icon: <FiDollarSign size={12} />,
                accent: "var(--color-primary)",
              },
              {
                label: "Growth Rate",
                value: `+${matched.growthRate}%`,
                icon: <FiTrendingUp size={12} />,
                accent: "var(--color-secondary)",
              },
              {
                label: "Remote Index",
                value: `${matched.remoteAvailability}%`,
                icon: <FiWifi size={12} />,
                accent: "var(--color-tertiary)",
              },
            ].map((stat) => (
              <div>
                <div
                  className="rounded-xl p-3"
                  key={stat.label}
                  style={{
                    background: "var(--color-surface-container-high)",
                    borderLeft: `3px solid ${stat.accent}`,
                  }}
                >
                  <p
                    style={{ color: "var(--color-on-surface-variant)" }}
                    className="label-precision text-[9px] uppercase mb-1 flex items-center gap-1 tracking-widest"
                  >
                    {stat.icon}
                    {stat.label}
                  </p>
                  <p
                    className="label-precision text-lg font-black"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {stat.value}
                  </p>
                  {/* Interpretation */}
                  <p
                    className="text-sm mt-4 leading-relaxed"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {matched.interpretation}
                  </p>

                  <button
                    className="mt-4 flex items-center gap-2 text-sm font-bold transition-colors"
                    style={{ color: "var(--color-primary)" }}
                    onClick={() => search(matched.category)}
                  >
                    View Full Market Analysis
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            {/* ── Skills found ─────────────────────────────── */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: "var(--color-surface-container)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FiCheckCircle
                  size={18}
                  style={{ color: "var(--color-secondary)" }}
                />
                <h3
                  className="headline text-lg font-bold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Skills Detected
                </h3>
                <span
                  className="label-precision text-xs px-2 py-1 rounded-full"
                  style={{
                    background: "var(--color-secondary-container)",
                    color: "black",
                  }}
                >
                  {data.extractedSkills.length} found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.extractedSkills.map((skill) => (
                  <SkillTag key={skill} skill={skill} variant="secondary" />
                ))}
              </div>
            </div>
            {/* {data.skillGaps.length > 0 && (
              <div
                className="rounded-2xl p-6 mb-8"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FiAlertCircle
                    size={18}
                    style={{ color: "var(--color-tertiary)" }}
                  />
                  <h3
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Skill Gaps to Fill
                  </h3>
                  <span
                    className="label-precision text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "var(--color-tertiary-container)",
                      color: "var(--color-tertiary)",
                    }}
                  >
                    {data.skillGaps.length} missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.skillGaps.map((dta) => (
                    <div
                      key={dta.skill}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                      style={{
                        background:
                          dta.importance === "high"
                            ? "var(--color-error-container)"
                            : dta.importance === "medium"
                              ? "var(--color-tertiary-container)"
                              : "var(--color-surface-container-high)",
                        color:
                          dta.importance === "high"
                            ? "var(--color-on-error-container)"
                            : dta.importance === "medium"
                              ? "var(--color-tertiary)"
                              : "var(--color-on-surface-variant)",
                      }}
                    >
                      <span className="font-medium">{dta.skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
            {/* summry */}

                   <div
              className="rounded-2xl p-6 mb-8"
              style={{
                background: "var(--color-surface-container)",
                borderLeft: "4px solid var(--color-primary)",
              }}
            >
              <p
                className="label-precision text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-primary)" }}
              >
                Analysis Summary
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                {data.summary}
              </p>
            </div>
            {/* recomandation */}
            {
          
              data.recommendations?.length >
               0 && (
                <div>
                  <div className="flex items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold headline"
                     style={{ color: "var(--color-on-surface)" }}
                  >
                    You might also consider
                    </h3>
                    <div className="flex-grow h-px"
                    style={{ background: "var(--color-outline)" }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {
                      data.recommendations.map((rec)=>(
                        <JobCard
                      key={rec.title}
                      title={rec.title}
                      category={rec.category}
                      demandScore={rec.demandScore}
                      similarity={rec.similarityScore}
                      trend="rising"
                      topSkills={[]}
                      reason={rec.reason}  
                      />
                      ))
                    }
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Resume;
