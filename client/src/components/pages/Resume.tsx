import React, { useRef, useState } from "react";
import { useResumeAnalysis } from "../../hooks/useResumeAnalysis";
import { UseSearch } from "../../hooks/useSearch";
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
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import LoadingSpinner from "../ui/LoadingSpinner";
import TrendBadge from "../ui/TrendBadge";
import SkillTag from "../ui/SkillingTag";
import JobCard from "../ui/JobCard";

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleSelectFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (files) handleSelectFile(files);
  };

  const handleAnalysis = () => {
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
      ? "#30D158"
      : matched && matched.demandScore >= 50
      ? "#32D9FA"
      : matched && matched.demandScore >= 38
      ? "#FF9F0A"
      : "#FF453A";

  // Data mapping for Recharts visualizations
  const radarData = data
    ? [
        { subject: "Technical", A: data.resumeScore, fullMark: 100 },
        { subject: "Market Match", A: matched?.matchScore || 0, fullMark: 100 },
        { subject: "Demand", A: matched?.demandScore || 0, fullMark: 100 },
        { subject: "Growth", A: matched?.growthRate || 0, fullMark: 100 },
        { subject: "Remote Fit", A: matched?.remoteAvailability || 0, fullMark: 100 },
      ]
    : [];

  const marketMetricsData = matched
    ? [
        { name: "Demand %", value: matched.demandScore, fill: scoreColor },
        { name: "Growth %", value: matched.growthRate, fill: "#30D158" },
        { name: "Remote %", value: matched.remoteAvailability, fill: "#32D9FA" },
      ]
    : [];

  const gaugeData = data
    ? [
        {
          name: "Score",
          value: data.resumeScore,
          fill: scoreColor,
        },
      ]
    : [];

  return (
    <div
      className="min-h-screen pb-12"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            AI-Powered Intelligence
          </p>
          <h1
            className="headline font-extrabold tracking-tighter mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Resume Analyzer & Skill Matcher
          </h1>
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Upload your PDF resume to extract skills, compare against market
            demand benchmarks, and view targeted career path visual metrics.
          </p>
        </div>

        {/* Upload Section */}
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
              onDrop={handleDrag}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleInputChange}
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

            <div className="flex gap-3">
              <button
                onClick={handleAnalysis}
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
        )}

        {/* Error Notification */}
        {error && (
          <div
            className="rounded-xl p-4 flex items-center gap-3 mb-4 max-w-2xl"
            style={{
              background: "var(--color-error-container)",
              color: "var(--color-on-error-container)",
            }}
          >
            <FiAlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Analytics Results Dashboard */}
        {data && matched && (
          <div className="space-y-8">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <FiX size={14} />
              Analyze another resume
            </button>

            {/* Top Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radial Score Gauge */}
              <div
                className="lg:col-span-4 rounded-2xl p-6 flex flex-col items-center justify-between"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="text-center w-full">
                  <p
                    className="label-precision text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Overall Assessment
                  </p>
                  <h3
                    className="headline text-xl font-bold mt-1"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {data.resumeScore >= 70
                      ? "Strong Profile"
                      : data.resumeScore >= 50
                      ? "Good Profile"
                      : data.resumeScore >= 35
                      ? "Developing Profile"
                      : "Needs Improvement"}
                  </h3>
                </div>

                <div className="w-full h-48 relative flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      barSize={12}
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        background={{ fill: "var(--color-surface-container-high)" }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span
                      className="text-4xl font-black"
                      style={{ color: scoreColor }}
                    >
                      {data.resumeScore}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-widest mt-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Out of 100
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs text-center px-4"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Based on detected skills, market fit quality, and current industry demand.
                </p>
              </div>

              {/* Best Career Match Details */}
              <div
                className="lg:col-span-8 rounded-2xl p-8 flex flex-col justify-between"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p
                        className="label-precision text-xs font-bold uppercase tracking-widest mb-1"
                        style={{ color: "var(--color-primary)" }}
                      >
                        Best Career Match
                      </p>
                      <h2
                        className="headline text-3xl font-extrabold tracking-tight"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {matched.title}
                      </h2>
                    </div>
                    <TrendBadge
                      trend={matched.trend as "rising" | "declining" | "stable"}
                    />
                  </div>

                  {/* Match Progress Bar */}
                  <div className="my-6">
                    <div className="flex justify-between text-xs label-precision mb-2">
                      <span style={{ color: "var(--color-on-surface-variant)" }}>
                        Skill Match Alignment
                      </span>
                      <span className="font-bold" style={{ color: scoreColor }}>
                        {matched.matchScore}%
                      </span>
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

                {/* Key Metrics Quick View */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--color-surface-container-high)",
                      borderLeft: `3px solid ${scoreColor}`,
                    }}
                  >
                    <p
                      className="label-precision text-[9px] uppercase mb-1 flex items-center gap-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <FiBriefcase size={12} /> Demand Score
                    </p>
                    <p className="text-base font-bold">{matched.demandScore}%</p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--color-surface-container-high)",
                      borderLeft: "3px solid var(--color-primary)",
                    }}
                  >
                    <p
                      className="label-precision text-[9px] uppercase mb-1 flex items-center gap-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <FiDollarSign size={12} /> Avg Salary
                    </p>
                    <p className="text-base font-bold">
                      ${(matched.averageSalary / 1000).toFixed()}k
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--color-surface-container-high)",
                      borderLeft: "3px solid #30D158",
                    }}
                  >
                    <p
                      className="label-precision text-[9px] uppercase mb-1 flex items-center gap-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <FiTrendingUp size={12} /> Growth
                    </p>
                    <p className="text-base font-bold">+{matched.growthRate}%</p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: "var(--color-surface-container-high)",
                      borderLeft: "3px solid #32D9FA",
                    }}
                  >
                    <p
                      className="label-precision text-[9px] uppercase mb-1 flex items-center gap-1"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <FiWifi size={12} /> Remote Index
                    </p>
                    <p className="text-base font-bold">
                      {matched.remoteAvailability}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Radar Chart: Skill Matrix */}
              <div
                className="lg:col-span-6 rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FiPieChart
                    size={18}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <h3
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Profile Breakdown
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--color-outline)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "var(--color-on-surface-variant)", fontSize: 11 }}
                      />
                      <Radar
                        name="Candidate"
                        dataKey="A"
                        stroke="var(--color-primary)"
                        fill="var(--color-primary)"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Market Indicators */}
              <div
                className="lg:col-span-6 rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <FiBarChart2
                    size={18}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <h3
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Market Indicators
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketMetricsData}>
                      <XAxis
                        dataKey="name"
                        stroke="var(--color-on-surface-variant)"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-surface-container-high)",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {marketMetricsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Skills & Analysis Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Detected Skills */}
              <div
                className="lg:col-span-6 rounded-2xl p-6 flex flex-col justify-between"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FiCheckCircle
                      size={18}
                      style={{ color: "#30D158" }}
                    />
                    <h3
                      className="headline text-lg font-bold"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      Detected Skills
                    </h3>
                    <span
                      className="label-precision text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: "var(--color-surface-container-high)",
                        color: "var(--color-on-surface)",
                      }}
                    >
                      {data.extractedSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.extractedSkills.map((skill) => (
                      <SkillTag
                        key={skill}
                        skill={skill}
                        variant="secondary"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div
                className="lg:col-span-6 rounded-2xl p-6 flex flex-col justify-between"
                style={{
                  background: "var(--color-surface-container)",
                  borderLeft: "4px solid var(--color-primary)",
                }}
              >
                <div>
                  <p
                    className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
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
                <button
                  className="mt-6 flex items-center gap-2 text-sm font-bold transition-colors"
                  style={{ color: "var(--color-primary)" }}
                  onClick={() => search(matched.category)}
                >
                  View Full Market Analysis <FiArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Recommendations Section */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center mb-6 gap-4">
                  <h3
                    className="text-2xl font-bold headline"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    You Might Also Consider
                  </h3>
                  <div
                    className="flex-grow h-px"
                    style={{ background: "var(--color-outline)" }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data.recommendations.map((rec) => (
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
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;