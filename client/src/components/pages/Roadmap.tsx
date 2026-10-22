import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiCompass,
  FiClock,
  FiDollarSign,
  FiAward,
  FiBookOpen,
  FiLayers,
  FiFolder,
  FiExternalLink,
  FiPlus,
  FiX,
  FiSliders,
  FiArrowRight,
  FiSearch,
} from "react-icons/fi";
import { useRoadmap } from "../../hooks/useRoadmap";
import { useInterviewRoles } from "../../hooks/useInterviewQuestions";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";

interface LocationState {
  targetRole?: string;
  matchedTitle?: string;
  skills?: string[];
  skillGaps?: string[];
  summary?: string;
}

const PRESET_TRACKS = [
  "Artificial Intelligence & Machine Learning",
  "Software Development",
  "Cloud Architecture & DevOps",
  "Cybersecurity Engineering",
  "Data Science & Engineering",
  "Mobile Engineering (React Native / iOS)",
  "Distributed Systems (Rust / Go)",
];

const COMMITMENT_OPTIONS = [
  "5–10 hrs / week (Part-time)",
  "10–15 hrs / week (Recommended)",
  "20+ hrs / week (Accelerated)",
];

const SENIORITY_LEVELS = [
  "Junior to Mid-Level",
  "Mid-Level to Senior",
  "Senior to Staff / Lead",
];

export default function Roadmap() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [targetRole, setTargetRole] = useState<string>(
    state.targetRole || state.matchedTitle || "Artificial Intelligence & Machine Learning"
  );
  const [currentSkills, setCurrentSkills] = useState<string[]>(
    state.skills || ["Python", "SQL", "Git"]
  );
  const [skillGaps, setSkillGaps] = useState<string[]>(
    state.skillGaps || ["PyTorch", "Transformers", "Docker", "MLOps"]
  );
  const [seniority, setSeniority] = useState<string>("Mid-Level to Senior");
  const [timeCommitment, setTimeCommitment] = useState<string>("10–15 hrs / week (Recommended)");

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [newGapInput, setNewGapInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Completed checklist milestones state (stored per role in localStorage)
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  const { data: dbRoles } = useInterviewRoles();
  const { roadmap, loading, error, generate } = useRoadmap();

  // Load milestone progress from localStorage when role changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`roadmap_progress_${targetRole}`);
      if (saved) {
        setCompletedMilestones(JSON.parse(saved));
      } else {
        setCompletedMilestones({});
      }
    } catch (_) {}
  }, [targetRole]);

  // Initial generation
  useEffect(() => {
    if (!roadmap && !loading) {
      generate({
        targetRole,
        currentSkills,
        skillGaps,
        seniority,
        timeCommitment,
      });
    }
  }, []);

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`roadmap_progress_${targetRole}`, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleAddSkill = () => {
    const s = newSkillInput.trim();
    if (s && !currentSkills.includes(s)) {
      setCurrentSkills([...currentSkills, s]);
      setNewSkillInput("");
    }
  };

  const handleAddGap = () => {
    const g = newGapInput.trim();
    if (g && !skillGaps.includes(g)) {
      setSkillGaps([...skillGaps, g]);
      setNewGapInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setCurrentSkills(currentSkills.filter((s) => s !== skill));
  };

  const handleRemoveGap = (gap: string) => {
    setSkillGaps(skillGaps.filter((g) => g !== gap));
  };

  const handleGenerate = (roleToUse?: string) => {
    const role = roleToUse || targetRole;
    setTargetRole(role);
    setIsCustomizing(false);
    setIsSearchOpen(false);
    setSearchQuery("");

    generate({
      targetRole: role,
      currentSkills,
      skillGaps,
      seniority,
      timeCommitment,
    });
  };

  // Calculate milestone completion percentage
  const totalMilestones =
    roadmap?.phases.reduce((acc, p) => acc + (p.milestones?.length || 0), 0) || 0;
  const completedCount =
    roadmap?.phases.reduce(
      (acc, p) =>
        acc +
        (p.milestones?.filter((m) => completedMilestones[m.id])?.length || 0),
      0
    ) || 0;
  const progressPercent =
    totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  // Filtered db roles
  const filteredRoles = (dbRoles || []).filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* ── Sub-header Navigation ── */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-outline-variant)]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-medium transition-colors hover:text-white"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <FiArrowLeft size={13} />
            Back to Overview
          </button>

          <div className="flex items-center gap-3">
            <span
              className="label-precision font-mono text-xs px-2.5 py-1 rounded border"
              style={{
                borderColor: "var(--color-outline)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              Engine: Active
            </span>
          </div>
        </div>

        {/* ── Section Title & Track Selector ── */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  Personalized Upskilling Pathway
                </span>
                <span
                  className="label-precision font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1"
                  style={{
                    background: "var(--color-primary-container)",
                    color: "var(--color-primary)",
                  }}
                >
                  <FiCompass size={11} /> Milestone Engine
                </span>
              </div>

              <h1
                className="headline font-bold tracking-tight mb-2"
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  color: "var(--color-on-surface)",
                }}
              >
                Career Roadmap & Skill-Bridge Engine
              </h1>

              <p
                className="text-xs md:text-sm max-w-2xl leading-relaxed"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Step-by-step technical milestones, portfolio deliverables, and curated
                learning resources to bridge your skill gaps and unlock compensation growth.
              </p>
            </div>

            {/* Role Search Bar */}
            <div className="relative w-full lg:w-80 shrink-0">
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all focus-within:border-[var(--color-primary)]"
                style={{
                  background: "var(--color-surface)",
                  borderColor: isSearchOpen
                    ? "var(--color-primary)"
                    : "var(--color-outline)",
                }}
              >
                <FiSearch size={14} style={{ color: "var(--color-on-surface-variant)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      handleGenerate(searchQuery.trim());
                    }
                  }}
                  placeholder="Search any career track..."
                  className="w-full text-xs outline-none bg-transparent"
                  style={{ color: "var(--color-on-surface)" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <FiX size={13} style={{ color: "var(--color-on-surface-variant)" }} />
                  </button>
                )}
              </div>

              {isSearchOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-full rounded-xl border shadow-2xl p-2 z-50 max-h-72 overflow-y-auto animate-fadeIn"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-outline)",
                  }}
                >
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleGenerate(searchQuery.trim())}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between text-xs mb-1 border border-dashed"
                      style={{
                        borderColor: "var(--color-outline)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <span className="truncate">
                        Map Track: <strong>"{searchQuery.trim()}"</strong>
                      </span>
                      <FiPlus size={13} />
                    </button>
                  )}
                  {filteredRoles.map((role) => (
                    <button
                      key={role.category}
                      onClick={() => handleGenerate(role.title)}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors text-xs truncate"
                      style={{
                        color:
                          role.title === targetRole
                            ? "var(--color-primary)"
                            : "var(--color-on-surface)",
                      }}
                    >
                      {role.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preset Quick-Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span
              className="label-precision font-mono text-[10px] uppercase font-bold shrink-0 mr-1"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Popular Tracks:
            </span>
            {PRESET_TRACKS.map((track) => {
              const isActive = targetRole === track;
              return (
                <button
                  key={track}
                  onClick={() => handleGenerate(track)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                    isActive ? "font-bold" : "hover:border-[var(--color-outline)]"
                  }`}
                  style={{
                    background: isActive
                      ? "var(--color-surface-container-high)"
                      : "transparent",
                    borderColor: isActive
                      ? "var(--color-primary)"
                      : "var(--color-outline-variant)",
                    color: isActive
                      ? "var(--color-primary)"
                      : "var(--color-on-surface-variant)",
                  }}
                >
                  {track}
                </button>
              );
            })}
          </div>

          {/* Active Track Bar & Customization Button */}
          <div
            className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span
                className="label-precision font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                style={{
                  background: "var(--color-surface-container-high)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Selected Pathway
              </span>
              <span className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
                {roadmap?.roleTitle || targetRole}
              </span>
              <span
                className="label-precision font-mono text-[10px] px-2 py-0.5 rounded border"
                style={{
                  borderColor: "var(--color-outline)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                {roadmap?.seniority || seniority}
              </span>
            </div>

            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium self-start sm:self-auto hover:bg-white/5 transition-colors"
              style={{
                borderColor: isCustomizing
                  ? "var(--color-primary)"
                  : "var(--color-outline)",
                color: isCustomizing
                  ? "var(--color-primary)"
                  : "var(--color-on-surface)",
              }}
            >
              <FiSliders size={12} />
              <span>{isCustomizing ? "Close Parameters" : "Customize Skills & Scope"}</span>
            </button>
          </div>

          {/* Customization Drawer */}
          {isCustomizing && (
            <div
              className="p-5 rounded-xl border animate-fadeIn space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-outline)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Target Role */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Target Career Title
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline)",
                      color: "var(--color-on-surface)",
                    }}
                  />
                </div>

                {/* Seniority */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Target Seniority
                  </label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {SENIORITY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Commitment */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Weekly Commitment
                  </label>
                  <select
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    {COMMITMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills Gaps Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Current Known Skills */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Skills You Already Know
                  </label>
                  <div
                    className="p-2.5 rounded-lg border space-y-2 min-h-24"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {currentSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border"
                          style={{
                            background: "var(--color-surface)",
                            borderColor: "var(--color-outline)",
                            color: "var(--color-on-surface)",
                          }}
                        >
                          <span>{skill}</span>
                          <button onClick={() => handleRemoveSkill(skill)}>
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                        placeholder="Add known skill..."
                        className="flex-1 px-2.5 py-1 text-xs rounded border outline-none bg-transparent"
                        style={{ borderColor: "var(--color-outline)" }}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-2.5 py-1 text-xs rounded border hover:bg-white/5"
                        style={{ borderColor: "var(--color-outline)" }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skill Gaps to Bridge */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Key Skill Gaps to Bridge
                  </label>
                  <div
                    className="p-2.5 rounded-lg border space-y-2 min-h-24"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {skillGaps.map((gap) => (
                        <span
                          key={gap}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border"
                          style={{
                            background: "rgba(255, 184, 77, 0.1)",
                            borderColor: "rgba(255, 184, 77, 0.3)",
                            color: "var(--color-tertiary)",
                          }}
                        >
                          <span>{gap}</span>
                          <button onClick={() => handleRemoveGap(gap)}>
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={newGapInput}
                        onChange={(e) => setNewGapInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddGap()}
                        placeholder="Add skill gap to bridge..."
                        className="flex-1 px-2.5 py-1 text-xs rounded border outline-none bg-transparent"
                        style={{ borderColor: "var(--color-outline)" }}
                      />
                      <button
                        onClick={handleAddGap}
                        className="px-2.5 py-1 text-xs rounded border hover:bg-white/5"
                        style={{ borderColor: "var(--color-outline)" }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs hover:bg-white/5"
                  style={{ borderColor: "var(--color-outline)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerate()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                  }}
                >
                  Regenerate Roadmap
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-28">
            <LoadingSpinner
              size="lg"
              text="Synthesizing personalized career roadmap and portfolio milestones..."
            />
            <p
              className="label-precision font-mono text-xs mt-3 max-w-sm text-center"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Aligning syllabus with real-world hiring loop competencies for {targetRole}...
            </p>
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => handleGenerate()} />
          </div>
        )}

        {/* ── Active Roadmap Presentation ── */}
        {roadmap && !loading && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview & Progress Header Card */}
            <div
              className="rounded-xl border p-6 md:p-8"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-outline)",
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--color-outline-variant)]">
                <div>
                  <span
                    className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider block mb-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Strategy Overview
                  </span>
                  <p
                    className="text-sm md:text-base leading-relaxed max-w-2xl font-medium"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {roadmap.summary}
                  </p>
                </div>

                {/* Metrics Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="p-3.5 rounded-xl border flex items-center gap-3"
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(50, 224, 161, 0.15)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <FiDollarSign size={16} />
                    </div>
                    <div>
                      <div
                        className="label-precision font-mono font-bold text-sm"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {roadmap.estimatedSalaryUplift}
                      </div>
                      <div
                        className="label-precision font-mono text-[10px] uppercase font-semibold"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        Projected Uplift
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-xl border flex items-center gap-3"
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: "var(--color-surface-container-high)",
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      <FiClock size={15} />
                    </div>
                    <div>
                      <div
                        className="label-precision font-mono font-bold text-sm"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {roadmap.durationWeeks} Weeks
                      </div>
                      <div
                        className="label-precision font-mono text-[10px] uppercase font-semibold"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        Estimated Timeline
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Milestone Progress Bar */}
              <div className="pt-6">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>
                      Roadmap Completion Progress
                    </span>
                    <span
                      className="label-precision font-mono text-[11px]"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      ({completedCount} of {totalMilestones} Milestones Checked)
                    </span>
                  </div>
                  <span
                    className="label-precision font-mono font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: "var(--color-surface-container-highest)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      background: "var(--color-primary)",
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ── Sequential Phases Timeline ── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3
                  className="headline text-base font-bold flex items-center gap-2"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  <FiLayers style={{ color: "var(--color-primary)" }} />
                  Phased Curriculum & Deliverables
                </h3>
                <span
                  className="label-precision font-mono text-xs"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {roadmap.phases.length} Phases
                </span>
              </div>

              {roadmap.phases.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="rounded-xl border overflow-hidden transition-all hover:border-[var(--color-outline)]"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-outline-variant)",
                  }}
                >
                  {/* Phase Header */}
                  <div
                    className="p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3"
                    style={{
                      background: "var(--color-surface-container-low)",
                      borderColor: "var(--color-outline-variant)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0"
                        style={{
                          background: "var(--color-primary-container)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {String(phase.phaseNumber).padStart(2, "0")}
                      </span>
                      <div>
                        <h4
                          className="font-bold text-sm md:text-base"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {phase.title}
                        </h4>
                        <p
                          className="text-xs mt-0.5 line-clamp-1"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {phase.objective}
                        </p>
                      </div>
                    </div>

                    <span
                      className="label-precision font-mono text-xs px-2.5 py-1 rounded border shrink-0 self-start md:self-auto"
                      style={{
                        borderColor: "var(--color-outline)",
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      {phase.duration}
                    </span>
                  </div>

                  {/* Phase Body */}
                  <div className="p-6 space-y-6">
                    {/* Topics Covered */}
                    <div>
                      <span
                        className="label-precision font-mono text-[10px] font-bold uppercase tracking-wider block mb-2"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        Core Topics & Architecture Concepts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {phase.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="label-precision font-mono text-xs px-2.5 py-1 rounded border"
                            style={{
                              background: "var(--color-surface-container-lowest)",
                              borderColor: "var(--color-outline-variant)",
                              color: "var(--color-on-surface)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Milestone Checklists */}
                    {phase.milestones && phase.milestones.length > 0 && (
                      <div
                        className="p-4 rounded-lg border space-y-2.5"
                        style={{
                          background: "var(--color-surface-container-lowest)",
                          borderColor: "var(--color-outline-variant)",
                        }}
                      >
                        <span
                          className="label-precision font-mono text-[10px] font-bold uppercase tracking-wider block mb-1"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Verification Milestones & Competencies
                        </span>
                        <div className="space-y-2">
                          {phase.milestones.map((m) => {
                            const isDone = !!completedMilestones[m.id];
                            return (
                              <label
                                key={m.id}
                                className="flex items-start gap-2.5 text-xs cursor-pointer select-none group"
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleMilestone(m.id)}
                                  className="mt-0.5 rounded cursor-pointer accent-[var(--color-primary)] shrink-0"
                                />
                                <span
                                  className={`leading-relaxed transition-colors ${
                                    isDone ? "line-through opacity-50" : "opacity-90"
                                  }`}
                                  style={{ color: "var(--color-on-surface)" }}
                                >
                                  {m.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Portfolio Project Artifact */}
                    {phase.projects && phase.projects.length > 0 && (
                      <div>
                        <span
                          className="label-precision font-mono text-[10px] font-bold uppercase tracking-wider block mb-2"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          Portfolio Deliverable
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {phase.projects.map((proj, pIdx) => (
                            <div
                              key={pIdx}
                              className="p-4 rounded-lg border space-y-2"
                              style={{
                                background: "var(--color-surface-container-low)",
                                borderColor: "var(--color-outline-variant)",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <FiFolder
                                  size={14}
                                  style={{ color: "var(--color-primary)" }}
                                />
                                <h5
                                  className="font-bold text-xs"
                                  style={{ color: "var(--color-on-surface)" }}
                                >
                                  {proj.title}
                                </h5>
                              </div>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--color-on-surface-variant)" }}
                              >
                                {proj.description}
                              </p>
                              <div className="pt-1">
                                <span
                                  className="label-precision font-mono text-[10px] font-semibold block"
                                  style={{ color: "var(--color-primary)" }}
                                >
                                  Deliverable: {proj.deliverable}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {phase.resources && phase.resources.length > 0 && (
                      <div>
                        <span
                          className="label-precision font-mono text-[10px] font-bold uppercase tracking-wider block mb-2"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          Curated Learning References
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {phase.resources.map((res, rIdx) => (
                            <a
                              key={rIdx}
                              href={res.url || `https://www.google.com/search?q=${encodeURIComponent(res.title)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:bg-white/5"
                              style={{
                                borderColor: "var(--color-outline-variant)",
                                color: "var(--color-on-surface)",
                              }}
                            >
                              <FiBookOpen size={12} style={{ color: "var(--color-tertiary)" }} />
                              <span className="truncate max-w-[220px]">{res.title}</span>
                              {res.free && (
                                <span
                                  className="text-[9px] uppercase px-1 rounded font-bold"
                                  style={{
                                    background: "rgba(50, 224, 161, 0.15)",
                                    color: "var(--color-primary)",
                                  }}
                                >
                                  Free
                                </span>
                              )}
                              <FiExternalLink size={10} className="opacity-50" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Recommended Certifications & Capstones ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap.certifications && roadmap.certifications.length > 0 && (
                <div
                  className="rounded-xl border p-5 space-y-3"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-outline)",
                  }}
                >
                  <h4
                    className="headline text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <FiAward size={15} />
                    High-ROI Industry Certifications
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {roadmap.certifications.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        <span style={{ color: "var(--color-primary)" }}>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {roadmap.recommendedPortfolioProjects &&
                roadmap.recommendedPortfolioProjects.length > 0 && (
                  <div
                    className="rounded-xl border p-5 space-y-3"
                    style={{
                      background: "var(--color-surface)",
                      borderColor: "var(--color-outline)",
                    }}
                  >
                    <h4
                      className="headline text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "var(--color-tertiary)" }}
                    >
                      <FiFolder size={15} />
                      Capstone Portfolio Priorities
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {roadmap.recommendedPortfolioProjects.map((p, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          <span style={{ color: "var(--color-tertiary)" }}>•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* ── Next Step Call to Action: Test in Mock Interview ── */}
            <div
              className="rounded-xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-outline)",
              }}
            >
              <div>
                <h4
                  className="font-bold text-sm mb-1"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Ready to test your comprehension?
                </h4>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Launch the Technical & Behavioral Interview Simulator for {targetRole} to
                  practice questions calibrated to this roadmap.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/interview-prep", {
                    state: {
                      matchedTitle: targetRole,
                      skills: currentSkills.concat(skillGaps),
                    },
                  })
                }
                className="px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0 transition-all shadow-sm"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                }}
              >
                <span>Launch Mock Interview Simulator</span>
                <FiArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
