import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiCheckCircle,
  FiSliders,
  FiSearch,
  FiPlus,
  FiX,
  FiEdit3,
} from "react-icons/fi";
import {
  useInterviewQuestions,
  useInterviewRoles,
} from "../../hooks/useInterviewQuestions";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import InterviewQuestions from "../ui/InterviewQuestions";
import MockInterviewSimulator from "../ui/MockInterviewSimulator";
import GeminiKeyModal from "../ui/GeminiKeyModal";
import type { InterviewRole } from "../../types";

interface LocationState {
  matchedTitle?: string;
  skills?: string[];
  summary?: string;
}

const SENIORITY_LEVELS = [
  "Junior (0–2 yrs)",
  "Mid-Level (3–5 yrs)",
  "Senior (5–8 yrs)",
  "Staff / Principal (8+ yrs)",
];

const PRESET_TRACKS = [
  "Artificial Intelligence & Machine Learning",
  "Software Development",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "DevOps & Platform Engineering",
  "Mobile App Development (React Native / iOS)",
  "Distributed Systems (Rust / Go)",
];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [activeMode, setActiveMode] = useState<"simulator" | "bank">("simulator");
  const [selectedRole, setSelectedRole] = useState<string>(
    state.matchedTitle || "Artificial Intelligence & Machine Learning"
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    state.skills || []
  );
  const [seniority, setSeniority] = useState<string>("Senior (5–8 yrs)");
  const [customFocus, setCustomFocus] = useState<string>("");

  // Search & Track customization states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    () => localStorage.getItem("gemini_api_key") || ""
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { data: dbRoles } = useInterviewRoles();
  const { data, loading, error, generate } = useInterviewQuestions();

  const hasResumeContext = !!(state.matchedTitle && state.skills?.length);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial generation
  useEffect(() => {
    if (!data && !loading) {
      if (hasResumeContext) {
        generate({
          matchedTitle: state.matchedTitle!,
          skills: state.skills!,
          summary: state.summary ?? "",
          seniority,
          apiKey: geminiApiKey || undefined,
        });
      } else if (dbRoles && dbRoles.length > 0) {
        const defaultRole =
          dbRoles.find((r) => r.title === selectedRole) || dbRoles[0]!;
        setSelectedRole(defaultRole.title);
        setSelectedSkills(defaultRole.topSkills);
        generate({
          matchedTitle: defaultRole.title,
          skills: defaultRole.topSkills,
          seniority,
          apiKey: geminiApiKey || undefined,
        });
      }
    }
  }, [dbRoles, hasResumeContext]);

  // Sync skills when API returns detected competencies
  useEffect(() => {
    if (data?.skills && data.skills.length > 0) {
      setSelectedSkills(data.skills);
    }
  }, [data]);

  // Handle selecting a predefined role
  const handleSelectRole = (role: InterviewRole) => {
    setSelectedRole(role.title);
    setSelectedSkills(role.topSkills);
    setIsSearchOpen(false);
    setSearchQuery("");

    generate({
      matchedTitle: role.title,
      skills: role.topSkills,
      seniority,
      customFocus,
      apiKey: geminiApiKey || undefined,
    });
  };

  // Handle custom track search submit
  const handleSearchSubmit = (roleName: string) => {
    const cleanName = roleName.trim();
    if (!cleanName) return;

    // Check if matches a dbRole
    const matchedDbRole = dbRoles?.find(
      (r) =>
        r.title.toLowerCase() === cleanName.toLowerCase() ||
        r.category.toLowerCase() === cleanName.toLowerCase()
    );

    setSelectedRole(cleanName);
    setIsSearchOpen(false);
    setSearchQuery("");

    if (matchedDbRole) {
      setSelectedSkills(matchedDbRole.topSkills);
      generate({
        matchedTitle: matchedDbRole.title,
        skills: matchedDbRole.topSkills,
        seniority,
        customFocus,
        apiKey: geminiApiKey || undefined,
      });
    } else {
      // Dynamic custom track without hardcoding
      setSelectedSkills([]);
      generate({
        matchedTitle: cleanName,
        skills: [],
        seniority,
        customFocus,
        apiKey: geminiApiKey || undefined,
      });
    }
  };

  // Handle applying customization drawer
  const handleApplyCustomTrack = () => {
    const targetTitle = customRoleInput.trim() || selectedRole;
    setSelectedRole(targetTitle);
    setIsCustomizeOpen(false);

    generate({
      matchedTitle: targetTitle,
      skills: selectedSkills,
      seniority,
      customFocus,
      apiKey: geminiApiKey || undefined,
    });
  };

  const handleAddSkill = () => {
    const clean = customSkillInput.trim();
    if (clean && !selectedSkills.includes(clean)) {
      setSelectedSkills([...selectedSkills, clean]);
      setCustomSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleRegenerate = () => {
    generate({
      matchedTitle: selectedRole,
      skills: selectedSkills,
      summary: state.summary ?? "",
      seniority,
      customFocus,
      apiKey: geminiApiKey || undefined,
    });
  };

  const handleKeySaved = (newKey: string) => {
    setGeminiApiKey(newKey);
    if (!data || error) {
      generate({
        matchedTitle: selectedRole,
        skills: selectedSkills,
        seniority,
        customFocus,
        apiKey: newKey || undefined,
      });
    }
  };

  // Filtered roles based on search input
  const filteredRoles = (dbRoles || []).filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* ── Sub-header Toolbar ── */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-outline-variant)]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-medium transition-colors hover:text-white"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            <FiArrowLeft size={13} />
            Back to Overview
          </button>

          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="flex items-center gap-2 text-xs font-mono label-precision px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
            style={{
              borderColor: "var(--color-outline)",
              color: "var(--color-on-surface-variant)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-primary)",
                boxShadow: "0 0 6px rgba(50, 224, 161, 0.6)",
              }}
            />
            <span>API Engine: {geminiApiKey ? "Custom Key" : "Connected"}</span>
            <FiSliders size={12} className="ml-1 opacity-70" />
          </button>
        </div>

        {/* ── Dynamic Search & Track Navigation Bar ── */}
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
                  Technical Screening Simulation
                </span>
                {hasResumeContext && (
                  <span
                    className="label-precision font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1"
                    style={{
                      background: "var(--color-primary-container)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <FiCheckCircle size={10} /> Resume Profile
                  </span>
                )}
              </div>

              <h1
                className="headline font-bold tracking-tight mb-2"
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  color: "var(--color-on-surface)",
                }}
              >
                Technical & Behavioral Interview Prep
              </h1>

              <p
                className="text-xs md:text-sm max-w-2xl leading-relaxed"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Search any target role, customize competencies, and practice
                real-world screening questions with benchmark rubrics.
              </p>
            </div>

            {/* Dynamic Search Box with Autocomplete & Custom Input */}
            <div
              ref={searchContainerRef}
              className="relative w-full lg:w-96 shrink-0"
            >
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all focus-within:border-[var(--color-primary)]"
                style={{
                  background: "var(--color-surface)",
                  borderColor: isSearchOpen
                    ? "var(--color-primary)"
                    : "var(--color-outline)",
                }}
              >
                <FiSearch
                  size={14}
                  style={{ color: "var(--color-on-surface-variant)" }}
                />
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
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  placeholder="Search or enter any role..."
                  className="w-full text-xs outline-none bg-transparent"
                  style={{ color: "var(--color-on-surface)" }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Live Search & Autocomplete Dropdown */}
              {isSearchOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-full rounded-xl border shadow-2xl p-2 z-50 max-h-80 overflow-y-auto animate-fadeIn"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-outline)",
                  }}
                >
                  {/* Option to create dynamic custom track */}
                  {searchQuery.trim() && (
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between text-xs mb-1 border border-dashed"
                      style={{
                        borderColor: "var(--color-outline)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FiPlus size={13} />
                        <span className="truncate">
                          Practice Custom Track: <strong className="text-white font-mono">"{searchQuery.trim()}"</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 uppercase shrink-0">
                        Dynamic Set
                      </span>
                    </button>
                  )}

                  {/* Matching Roles from Database */}
                  <div
                    className="px-2 py-1 label-precision font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Standard Tracks
                  </div>

                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <button
                        key={role.category}
                        onClick={() => handleSelectRole(role)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between text-xs"
                        style={{
                          color:
                            role.title === selectedRole
                              ? "var(--color-primary)"
                              : "var(--color-on-surface)",
                        }}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium truncate">{role.title}</p>
                          <p
                            className="text-[10px] truncate opacity-60 font-mono"
                            style={{ color: "var(--color-on-surface-variant)" }}
                          >
                            {role.topSkills.slice(0, 3).join(", ")}
                          </p>
                        </div>
                        {role.title === selectedRole && (
                          <FiCheckCircle
                            size={13}
                            style={{ color: "var(--color-primary)" }}
                          />
                        )}
                      </button>
                    ))
                  ) : !searchQuery.trim() ? (
                    <div
                      className="p-3 text-xs text-center"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      Start typing to search or create any custom track...
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* ── Active Track Details & Customization Bar ── */}
          <div
            className="p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3"
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
                Active Track
              </span>
              <span className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
                {data?.matchedTitle || selectedRole}
              </span>
              <span
                className="label-precision font-mono text-[10px] px-2 py-0.5 rounded border"
                style={{
                  borderColor: "var(--color-outline)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                {data?.seniority || seniority}
              </span>

              {/* Skills preview tags */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {(data?.skills || selectedSkills).slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="label-precision font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: "var(--color-surface-container-low)",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {(data?.skills || selectedSkills).length > 4 && (
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    +{(data?.skills || selectedSkills).length - 4} more
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setCustomRoleInput(selectedRole);
                setIsCustomizeOpen(!isCustomizeOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium self-start md:self-auto hover:bg-white/5 transition-colors"
              style={{
                borderColor: isCustomizeOpen
                  ? "var(--color-primary)"
                  : "var(--color-outline)",
                color: isCustomizeOpen
                  ? "var(--color-primary)"
                  : "var(--color-on-surface)",
              }}
            >
              <FiEdit3 size={12} />
              <span>{isCustomizeOpen ? "Close Customizer" : "Customize Track & Skills"}</span>
            </button>
          </div>

          {/* ── Customization Drawer (Accordion) ── */}
          {isCustomizeOpen && (
            <div
              className="p-5 rounded-xl border animate-fadeIn space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-outline)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-outline-variant)]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider label-precision font-mono">
                    Track Customization & Competency Parameters
                  </h4>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                    Tailor the role name, target seniority, and specific skills to test.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Role Title */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Target Career / Role
                  </label>
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Distributed Systems Engineer (Rust), Cloud SRE, etc."
                    className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                    style={{
                      background: "var(--color-surface-container-lowest)",
                      borderColor: "var(--color-outline)",
                      color: "var(--color-on-surface)",
                    }}
                  />
                </div>

                {/* Seniority Level */}
                <div>
                  <label
                    className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    Target Seniority Level
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SENIORITY_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeniority(lvl)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all text-left truncate ${
                          seniority === lvl ? "font-bold" : "opacity-70"
                        }`}
                        style={{
                          background:
                            seniority === lvl
                              ? "var(--color-surface-container-high)"
                              : "transparent",
                          borderColor:
                            seniority === lvl
                              ? "var(--color-primary)"
                              : "var(--color-outline-variant)",
                          color:
                            seniority === lvl
                              ? "var(--color-primary)"
                              : "var(--color-on-surface)",
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Tags Manager */}
              <div>
                <label
                  className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Specific Skills & Technologies to Test
                </label>
                <div
                  className="p-3 rounded-lg border space-y-2.5"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    borderColor: "var(--color-outline-variant)",
                  }}
                >
                  {/* Current Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border"
                        style={{
                          background: "var(--color-surface)",
                          borderColor: "var(--color-outline)",
                          color: "var(--color-on-surface)",
                        }}
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-400"
                        >
                          <FiX size={11} />
                        </button>
                      </span>
                    ))}
                    {selectedSkills.length === 0 && (
                      <span
                        className="text-xs italic"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        No specific skills pinned. Gemini AI will auto-detect modern standard skills for this role.
                      </span>
                    )}
                  </div>

                  {/* Add skill input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add custom skill (e.g., Kubernetes, Rust, PyTorch, GraphQL) and press Enter..."
                      className="flex-1 px-3 py-1.5 rounded-lg border outline-none text-xs"
                      style={{
                        background: "var(--color-surface)",
                        borderColor: "var(--color-outline)",
                        color: "var(--color-on-surface)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={!customSkillInput.trim()}
                      className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 hover:bg-white/5 transition-colors"
                      style={{
                        borderColor: "var(--color-outline)",
                        color: "var(--color-on-surface)",
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Practice Focus */}
              <div>
                <label
                  className="block label-precision font-mono text-[10px] uppercase font-bold mb-1.5"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Custom Practice Focus (Optional)
                </label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="e.g. Focus on distributed transactions, high-concurrency race conditions, and caching patterns..."
                  className="w-full px-3 py-2 rounded-lg border outline-none text-xs"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    borderColor: "var(--color-outline)",
                    color: "var(--color-on-surface)",
                  }}
                />
              </div>

              {/* Submit Customizer */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-white/5 transition-colors"
                  style={{
                    borderColor: "var(--color-outline)",
                    color: "var(--color-on-surface)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomTrack}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm"
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                  }}
                >
                  Apply & Generate Questions
                </button>
              </div>
            </div>
          )}

          {/* ── Preset Quick-Pills ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span
              className="label-precision font-mono text-[10px] uppercase font-bold shrink-0 mr-1"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Popular Tracks:
            </span>
            {PRESET_TRACKS.map((track) => {
              const isActive = selectedRole === track;
              return (
                <button
                  key={track}
                  onClick={() => handleSearchSubmit(track)}
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
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner
              size="lg"
              text="Curating question set from market benchmark competencies..."
            />
            <p
              className="label-precision font-mono text-xs mt-3 max-w-sm text-center"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Generating technical, behavioral, and domain challenges for {selectedRole}...
            </p>
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="mb-6 space-y-3">
            <ErrorMessage message={error} onRetry={handleRegenerate} />
            <div
              className="p-3 rounded-lg border flex items-center justify-between text-xs"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-outline)",
              }}
            >
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Need to verify API credentials? Configure your Gemini key in settings.
              </span>
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="px-3 py-1 rounded-md text-xs font-semibold border hover:bg-white/5 transition-colors"
                style={{
                  borderColor: "var(--color-outline)",
                  color: "var(--color-on-surface)",
                }}
              >
                Configure Key
              </button>
            </div>
          </div>
        )}

        {/* ── Main View (Simulator or Bank) ── */}
        {data && !loading && (
          <div className="space-y-6">
            {/* View Mode Switcher & Regenerate Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div
                className="inline-flex p-1 rounded-lg border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-outline)",
                }}
              >
                <button
                  onClick={() => setActiveMode("simulator")}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeMode === "simulator"
                      ? "shadow-sm font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    background:
                      activeMode === "simulator"
                        ? "var(--color-surface-container-high)"
                        : "transparent",
                    color:
                      activeMode === "simulator"
                        ? "var(--color-on-surface)"
                        : "var(--color-on-surface-variant)",
                  }}
                >
                  Interactive Practice
                </button>

                <button
                  onClick={() => setActiveMode("bank")}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeMode === "bank"
                      ? "shadow-sm font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    background:
                      activeMode === "bank"
                        ? "var(--color-surface-container-high)"
                        : "transparent",
                    color:
                      activeMode === "bank"
                        ? "var(--color-on-surface)"
                        : "var(--color-on-surface-variant)",
                  }}
                >
                  Question Bank & Hints
                </button>
              </div>

              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors self-end sm:self-auto hover:bg-white/5"
                style={{
                  borderColor: "var(--color-outline)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <FiRefreshCw size={12} />
                Regenerate Set
              </button>
            </div>

            {/* Mode 1: Simulator */}
            {activeMode === "simulator" && (
              <MockInterviewSimulator
                questions={data.questions}
                jobTitle={data.matchedTitle}
                skills={data.skills || selectedSkills}
                seniority={data.seniority || seniority}
                apiKey={geminiApiKey}
                onOpenKeyModal={() => setIsKeyModalOpen(true)}
              />
            )}

            {/* Mode 2: Question Bank */}
            {activeMode === "bank" && (
              <InterviewQuestions
                questions={data.questions}
                jobTitle={data.matchedTitle}
              />
            )}
          </div>
        )}

        {/* ── Key Modal ── */}
        <GeminiKeyModal
          isOpen={isKeyModalOpen}
          onClose={() => setIsKeyModalOpen(false)}
          onKeySaved={handleKeySaved}
        />
      </div>
    </div>
  );
}