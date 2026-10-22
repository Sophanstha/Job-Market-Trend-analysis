import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiMic,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiAward,
  FiBarChart2,
  FiArrowRight,
  FiRotateCcw,
  FiCode,
  FiUsers,
  FiBriefcase,
  FiBookOpen,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import type {
  InterviewQuestionSet,
  InterviewQuestion,
  AnswerEvaluation,
} from "../../types";
import { useInterviewEvaluation } from "../../hooks/useInterviewQuestions";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
  questions: InterviewQuestionSet;
  jobTitle: string;
  skills?: string[];
  seniority?: string;
  apiKey?: string;
  onOpenKeyModal: () => void;
}

type CategoryKey = "technical" | "behavioral" | "roleSpecific";

interface EvaluatedRecord {
  category: CategoryKey;
  questionIndex: number;
  questionText: string;
  userAnswer: string;
  evaluation: AnswerEvaluation;
}

export default function MockInterviewSimulator({
  questions,
  jobTitle,
  skills = [],
  seniority,
  apiKey,
  onOpenKeyModal,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("technical");
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedBenchmark, setCopiedBenchmark] = useState(false);
  const [sessionRecords, setSessionRecords] = useState<EvaluatedRecord[]>([]);
  const [showScorecard, setShowScorecard] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const { evaluate, loading, error, data: currentEvaluation, reset } =
    useInterviewEvaluation();

  // Current questions list
  const currentCategoryQuestions: InterviewQuestion[] =
    questions[activeCategory] || [];
  const currentQuestion: InterviewQuestion | undefined =
    currentCategoryQuestions[activeQuestionIndex];

  // Sync evaluation to sessionRecords when complete
  useEffect(() => {
    if (currentEvaluation && currentQuestion) {
      setSessionRecords((prev) => {
        const filtered = prev.filter(
          (r) =>
            !(
              r.category === activeCategory &&
              r.questionIndex === activeQuestionIndex
            )
        );
        return [
          ...filtered,
          {
            category: activeCategory,
            questionIndex: activeQuestionIndex,
            questionText: currentQuestion.question,
            userAnswer,
            evaluation: currentEvaluation,
          },
        ];
      });
    }
  }, [currentEvaluation]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch {
        // Recognition already stopped
      }
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Microphone dictation requires Chrome, Edge, or Safari.");
      return;
    }
    try {
      (recognitionRef.current as { start: () => void }).start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Speech start error:", err);
    }
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: {
        resultIndex: number;
        results: { [key: number]: { [key: number]: { transcript: string } }; length: number };
      }) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => {
          const separator = prev.endsWith(" ") || prev.length === 0 ? "" : " ";
          return prev + separator + transcript;
        });
      };

      rec.onerror = (e: unknown) => {
        console.warn("Speech recognition error:", e);
        stopRecording();
      };

      rec.onend = () => {
        stopRecording();
      };

      recognitionRef.current = rec;
    }

    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSelectQuestion = (cat: CategoryKey, idx: number) => {
    stopRecording();
    setActiveCategory(cat);
    setActiveQuestionIndex(idx);
    setShowHint(false);
    setShowIdealAnswer(false);
    reset();

    const existing = sessionRecords.find(
      (r) => r.category === cat && r.questionIndex === idx
    );
    if (existing) {
      setUserAnswer(existing.userAnswer);
    } else {
      setUserAnswer("");
    }
  };

  const handleNextQuestion = () => {
    if (activeQuestionIndex < currentCategoryQuestions.length - 1) {
      handleSelectQuestion(activeCategory, activeQuestionIndex + 1);
    } else if (activeCategory === "technical") {
      handleSelectQuestion("behavioral", 0);
    } else if (activeCategory === "behavioral") {
      handleSelectQuestion("roleSpecific", 0);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    evaluate({
      jobTitle,
      category: activeCategory,
      question: currentQuestion.question,
      hint: currentQuestion.hint,
      userAnswer: userAnswer.trim(),
      skills,
      seniority,
      apiKey,
    });
  };

  const handleCopyBenchmark = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBenchmark(true);
    setTimeout(() => setCopiedBenchmark(false), 1500);
  };

  // Find existing evaluation if already evaluated for this question
  const existingRecord = sessionRecords.find(
    (r) =>
      r.category === activeCategory &&
      r.questionIndex === activeQuestionIndex
  );
  const activeEval: AnswerEvaluation | null =
    currentEvaluation || existingRecord?.evaluation || null;

  // Average session score
  const sessionAvgScore =
    sessionRecords.length > 0
      ? (
          sessionRecords.reduce(
            (sum, r) => sum + r.evaluation.overallScore,
            0
          ) / sessionRecords.length
        ).toFixed(1)
      : null;

  const wordCount = userAnswer.trim()
    ? userAnswer.trim().split(/\s+/).length
    : 0;

  // Estimated speaking time: average 130 words per minute
  const estSpeakingTime = Math.ceil(wordCount / 130);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const categoryMeta: Record<
    CategoryKey,
    { name: string; icon: React.ReactNode; code: string }
  > = {
    technical: {
      name: "Technical Architecture",
      icon: <FiCode size={13} />,
      code: "TECH",
    },
    behavioral: {
      name: "Behavioral & Leadership",
      icon: <FiUsers size={13} />,
      code: "STAR",
    },
    roleSpecific: {
      name: "Domain Problem Solving",
      icon: <FiBriefcase size={13} />,
      code: "SPEC",
    },
  };

  const getStatusBadge = (score: number) => {
    if (score >= 9.0)
      return {
        label: "Exceeds Bar",
        bg: "rgba(50, 224, 161, 0.12)",
        text: "var(--color-primary)",
        border: "rgba(50, 224, 161, 0.3)",
      };
    if (score >= 7.5)
      return {
        label: "Meets Bar",
        bg: "rgba(50, 224, 161, 0.08)",
        text: "var(--color-primary)",
        border: "rgba(50, 224, 161, 0.2)",
      };
    if (score >= 5.5)
      return {
        label: "Developing",
        bg: "rgba(255, 184, 77, 0.12)",
        text: "var(--color-tertiary)",
        border: "rgba(255, 184, 77, 0.3)",
      };
    return {
      label: "Needs Review",
      bg: "rgba(255, 82, 102, 0.12)",
      text: "var(--color-error)",
      border: "rgba(255, 82, 102, 0.3)",
    };
  };

  return (
    <div className="space-y-6">
      {/* ── Section Navigation Toolbar ── */}
      <div
        className="rounded-xl p-2.5 border flex flex-col md:flex-row md:items-center justify-between gap-3"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-outline)",
        }}
      >
        {/* Segmented Control */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ background: "var(--color-surface-container-lowest)" }}
        >
          {(["technical", "behavioral", "roleSpecific"] as CategoryKey[]).map(
            (cat) => {
              const meta = categoryMeta[cat];
              const count = questions[cat]?.length || 0;
              const answered = sessionRecords.filter(
                (r) => r.category === cat
              ).length;
              const isActive = activeCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => handleSelectQuestion(cat, 0)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive ? "shadow-sm font-semibold" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    background: isActive
                      ? "var(--color-surface-container-high)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-on-surface)"
                      : "var(--color-on-surface-variant)",
                  }}
                >
                  <span
                    style={{
                      color: isActive
                        ? "var(--color-primary)"
                        : "var(--color-on-surface-variant)",
                    }}
                  >
                    {meta.icon}
                  </span>
                  <span>{meta.name}</span>
                  <span
                    className="label-precision text-[10px] px-1.5 py-0.2 rounded font-mono"
                    style={{
                      background: "var(--color-surface-container-highest)",
                      color:
                        answered === count && count > 0
                          ? "var(--color-primary)"
                          : "var(--color-on-surface-variant)",
                    }}
                  >
                    {answered}/{count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Session Metrics & Scorecard Toggle */}
        <div className="flex items-center gap-3 px-2">
          {sessionAvgScore && (
            <div
              className="flex items-center gap-2 text-xs font-mono label-precision"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <span>SESSION AVG:</span>
              <span
                className="font-bold text-sm px-2 py-0.5 rounded"
                style={{
                  background: "var(--color-primary-container)",
                  color: "var(--color-primary)",
                }}
              >
                {sessionAvgScore} / 10
              </span>
            </div>
          )}

          <button
            onClick={() => setShowScorecard(!showScorecard)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-white/5"
            style={{
              borderColor: "var(--color-outline)",
              color: "var(--color-on-surface)",
            }}
          >
            <FiBarChart2 size={13} />
            <span>Scorecard</span>
            <span
              className="label-precision font-mono text-[10px] px-1.5 py-0.2 rounded"
              style={{
                background: "var(--color-surface-container-high)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {sessionRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── Question Steps Indicator (Horizontal Monospace Stepper) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
        {currentCategoryQuestions.map((_, idx) => {
          const isCurrent = idx === activeQuestionIndex;
          const isAnswered = sessionRecords.some(
            (r) =>
              r.category === activeCategory && r.questionIndex === idx
          );
          const rec = sessionRecords.find(
            (r) =>
              r.category === activeCategory && r.questionIndex === idx
          );

          return (
            <button
              key={idx}
              onClick={() => handleSelectQuestion(activeCategory, idx)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono label-precision transition-all ${
                isCurrent
                  ? "border-[var(--color-primary)] font-bold text-white shadow-sm"
                  : "hover:border-[var(--color-outline)]"
              }`}
              style={{
                background: isCurrent
                  ? "var(--color-surface-container-high)"
                  : "var(--color-surface)",
                borderColor: isCurrent
                  ? "var(--color-primary)"
                  : "var(--color-outline-variant)",
                color: isCurrent
                  ? "var(--color-on-surface)"
                  : "var(--color-on-surface-variant)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: isAnswered
                    ? "var(--color-primary)"
                    : isCurrent
                    ? "var(--color-on-surface-variant)"
                    : "transparent",
                  border: isAnswered ? "none" : "1px solid var(--color-outline)",
                }}
              />
              <span>
                {String(idx + 1).padStart(2, "0")}
              </span>
              {rec && (
                <span
                  className="text-[10px] font-bold ml-1 opacity-90"
                  style={{ color: "var(--color-primary)" }}
                >
                  {rec.evaluation.overallScore}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Session Summary Scorecard (Collapsible) ── */}
      {showScorecard && (
        <div
          className="rounded-xl p-5 border"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-outline)",
          }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--color-outline-variant)]">
            <div className="flex items-center gap-2">
              <FiAward size={16} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
                Session Assessment Overview
              </h3>
            </div>
            <span
              className="label-precision font-mono text-xs px-2.5 py-1 rounded"
              style={{
                background: "var(--color-surface-container-high)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {sessionRecords.length} of{" "}
              {(questions.technical?.length || 0) +
                (questions.behavioral?.length || 0) +
                (questions.roleSpecific?.length || 0)}{" "}
              Complete
            </span>
          </div>

          {sessionRecords.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "var(--color-on-surface-variant)" }}>
              No questions evaluated yet. Type or record your response and run the assessment below.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {sessionRecords.map((rec, i) => (
                <div
                  key={i}
                  onClick={() =>
                    handleSelectQuestion(rec.category, rec.questionIndex)
                  }
                  className="p-3 rounded-lg border cursor-pointer hover:border-[var(--color-primary)] transition-all text-xs"
                  style={{
                    background: "var(--color-surface-container)",
                    borderColor: "var(--color-outline-variant)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="label-precision font-mono text-[10px] uppercase font-bold"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      {categoryMeta[rec.category].code} · #{rec.questionIndex + 1}
                    </span>
                    <span
                      className="label-precision font-mono font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {rec.evaluation.overallScore} / 10
                    </span>
                  </div>
                  <p
                    className="line-clamp-2 text-xs mb-2 leading-relaxed"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {rec.questionText}
                  </p>
                  <div
                    className="flex items-center gap-3 text-[10px] label-precision font-mono"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    <span>ACC: {rec.evaluation.scores.technicalAccuracy}</span>
                    <span>COM: {rec.evaluation.scores.clarityAndCommunication}</span>
                    <span>STR: {rec.evaluation.scores.completeness}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Active Question Workspace ── */}
      {currentQuestion && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-outline)",
          }}
        >
          {/* Question Header Bar */}
          <div
            className="p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3"
            style={{
              background: "var(--color-surface-container-low)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: "var(--color-surface-container-high)",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                {categoryMeta[activeCategory].code} · QUESTION{" "}
                {String(activeQuestionIndex + 1).padStart(2, "0")} /{" "}
                {String(currentCategoryQuestions.length).padStart(2, "0")}
              </span>
              <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
                {categoryMeta[activeCategory].name}
              </span>
            </div>

            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md transition-colors self-start md:self-auto hover:bg-white/5"
              style={{
                color: showHint
                  ? "var(--color-tertiary)"
                  : "var(--color-on-surface-variant)",
              }}
            >
              <FiHelpCircle size={13} />
              <span>{showHint ? "Hide Rubric Guide" : "View Rubric Guide"}</span>
            </button>
          </div>

          {/* Question Prompt */}
          <div className="p-6 md:p-8">
            <h2
              className="headline text-base md:text-xl font-bold leading-relaxed mb-4"
              style={{ color: "var(--color-on-surface)" }}
            >
              {currentQuestion.question}
            </h2>

            {/* Rubric / Hint Drawer */}
            {showHint && (
              <div
                className="mb-6 p-4 rounded-lg border text-xs leading-relaxed"
                style={{
                  background: "var(--color-surface-container)",
                  borderColor: "var(--color-tertiary)",
                  borderLeftWidth: "3px",
                  color: "var(--color-on-surface)",
                }}
              >
                <div
                  className="label-precision text-[10px] font-bold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-tertiary)" }}
                >
                  Key Evaluation Criteria
                </div>
                {currentQuestion.hint}
              </div>
            )}

            {/* Answer Editor Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span
                  className="label-precision font-mono text-[11px] uppercase tracking-wider font-semibold"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Candidate Response
                </span>

                <div className="flex items-center gap-4">
                  <span
                    className="label-precision font-mono text-[11px]"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    {wordCount} words {wordCount > 0 && `· ~${estSpeakingTime} min`}
                  </span>

                  {/* Dictation Control */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all ${
                      isRecording
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "border hover:bg-white/5"
                    }`}
                    style={{
                      borderColor: isRecording
                        ? undefined
                        : "var(--color-outline)",
                      color: isRecording
                        ? undefined
                        : "var(--color-on-surface-variant)",
                    }}
                    title="Speak your answer using voice dictation"
                  >
                    {isRecording ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
                        <span>REC {formatTimer(recordingSeconds)}</span>
                      </>
                    ) : (
                      <>
                        <FiMic size={12} />
                        <span>Dictate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Structure your answer clearly. For technical questions, highlight trade-offs and architecture. For behavioral, outline Situation, Task, Action, and Measurable Result..."
                className="w-full p-4 rounded-lg text-sm leading-relaxed outline-none transition-all resize-y font-normal"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  border: "1px solid var(--color-outline)",
                  color: "var(--color-on-surface)",
                  fontFamily: "var(--font-body)",
                }}
              />

              {error && (
                <div
                  className="p-3 rounded-lg border text-xs flex items-center justify-between"
                  style={{
                    background: "var(--color-error-container)",
                    borderColor: "var(--color-error)",
                    color: "var(--color-on-error)",
                  }}
                >
                  <span>{error}</span>
                  <button
                    onClick={onOpenKeyModal}
                    className="underline font-semibold ml-2 hover:opacity-80"
                  >
                    Configure Key
                  </button>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserAnswer("")}
                  disabled={!userAnswer}
                  className="px-3 py-2 rounded-lg text-xs font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 disabled:opacity-30"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  <FiRotateCcw size={12} />
                  Clear
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={loading || !userAnswer.trim()}
                    className="px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                    }}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Grading Candidate Response...</span>
                      </>
                    ) : (
                      <>
                        <FiSend size={13} />
                        <span>Run Assessment</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-4 py-2.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors hover:bg-white/5"
                    style={{
                      borderColor: "var(--color-outline)",
                      color: "var(--color-on-surface)",
                    }}
                  >
                    <span>Next</span>
                    <FiArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Candidate Evaluation Scorecard ── */}
      {activeEval && (
        <div
          className="rounded-xl border overflow-hidden space-y-6 p-6 md:p-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-outline)",
          }}
        >
          {/* Assessment Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-[var(--color-outline-variant)]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Screening Scorecard
                </span>
                {(() => {
                  const b = getStatusBadge(activeEval.overallScore);
                  return (
                    <span
                      className="label-precision font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border"
                      style={{
                        background: b.bg,
                        color: b.text,
                        borderColor: b.border,
                      }}
                    >
                      {b.label}
                    </span>
                  );
                })()}
              </div>
              <p
                className="text-sm leading-relaxed max-w-2xl"
                style={{ color: "var(--color-on-surface)" }}
              >
                {activeEval.summary}
              </p>
            </div>

            {/* Score Metric Tile */}
            <div
              className="p-4 rounded-xl border flex items-center gap-4 shrink-0"
              style={{
                background: "var(--color-surface-container)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div>
                <div
                  className="label-precision font-mono text-2xl font-bold tracking-tight"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {activeEval.overallScore.toFixed(1)}
                  <span
                    className="text-xs font-normal ml-1"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    / 10
                  </span>
                </div>
                <div
                  className="label-precision font-mono text-[10px] uppercase font-semibold"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Composite Score
                </div>
              </div>
            </div>
          </div>

          {/* Rubric Breakdown Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <span
                  className="font-medium"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Technical Depth
                </span>
                <span
                  className="label-precision font-mono font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {activeEval.scores.technicalAccuracy} / 10
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-container-highest)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: "var(--color-primary)",
                    width: `${activeEval.scores.technicalAccuracy * 10}%`,
                  }}
                />
              </div>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <span
                  className="font-medium"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Structure & Clarity
                </span>
                <span
                  className="label-precision font-mono font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {activeEval.scores.clarityAndCommunication} / 10
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-container-highest)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: "var(--color-primary)",
                    width: `${activeEval.scores.clarityAndCommunication * 10}%`,
                  }}
                />
              </div>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <span
                  className="font-medium"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Context & Resolution
                </span>
                <span
                  className="label-precision font-mono font-bold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {activeEval.scores.completeness} / 10
                </span>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-container-highest)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    background: "var(--color-primary)",
                    width: `${activeEval.scores.completeness * 10}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Strengths and Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h4
                className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                style={{ color: "var(--color-primary)" }}
              >
                <FiCheckCircle size={13} />
                Demonstrated Strengths
              </h4>
              <ul className="space-y-2 text-xs leading-relaxed" style={{ color: "var(--color-on-surface)" }}>
                {activeEval.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "var(--color-primary)" }}>•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <h4
                className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                style={{ color: "var(--color-tertiary)" }}
              >
                <FiAlertCircle size={13} />
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-xs leading-relaxed" style={{ color: "var(--color-on-surface)" }}>
                {activeEval.areasToImprove.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: "var(--color-tertiary)" }}>•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Staff-Level Benchmark Solution */}
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              background: "var(--color-surface-container-low)",
              borderColor: "var(--color-outline-variant)",
            }}
          >
            <div className="p-3.5 flex items-center justify-between border-b border-[var(--color-outline-variant)]">
              <button
                onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                className="flex items-center gap-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-on-surface)" }}
              >
                <FiBookOpen size={14} style={{ color: "var(--color-primary)" }} />
                <span>Staff Candidate Benchmark Response</span>
                <span
                  className="label-precision font-mono text-[10px] uppercase underline ml-1"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {showIdealAnswer ? "Hide" : "Expand Solution"}
                </span>
              </button>

              {showIdealAnswer && (
                <button
                  onClick={() => handleCopyBenchmark(activeEval.idealAnswer)}
                  className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {copiedBenchmark ? (
                    <>
                      <FiCheck size={12} style={{ color: "var(--color-primary)" }} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FiCopy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {showIdealAnswer && (
              <div
                className="p-4 text-xs leading-relaxed font-mono"
                style={{
                  background: "var(--color-surface-container-lowest)",
                  color: "var(--color-on-surface)",
                }}
              >
                {activeEval.idealAnswer}
              </div>
            )}
          </div>

          {/* Follow-up Probe */}
          {activeEval.followUpQuestion && (
            <div
              className="p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              style={{
                background: "var(--color-surface-container-low)",
                borderColor: "var(--color-outline-variant)",
              }}
            >
              <div>
                <span
                  className="label-precision font-mono text-[10px] font-bold uppercase tracking-wider block mb-1"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  Follow-up Technical Probe
                </span>
                <p className="font-medium" style={{ color: "var(--color-on-surface)" }}>
                  "{activeEval.followUpQuestion}"
                </p>
              </div>

              <button
                onClick={() => {
                  setUserAnswer("");
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-colors hover:bg-white/5"
                style={{
                  borderColor: "var(--color-outline)",
                  color: "var(--color-on-surface)",
                }}
              >
                Respond to Probe
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
