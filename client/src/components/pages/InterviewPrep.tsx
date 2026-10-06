import { useEffect }       from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiMessageSquare, FiRefreshCw } from "react-icons/fi";
import { useInterviewQuestions } from "../../hooks/useInterviewQuestions";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import InterviewQuestions from "../ui/InterviewQuestions";


interface LocationState {
  matchedTitle?: string;
  skills?:       string[];
  summary?:      string;
}

export default function InterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state ?? {}) as LocationState;

  const { data, loading, error, generate } = useInterviewQuestions();

  const hasResumeContext = !!(state.matchedTitle && state.skills?.length);

  // Auto-generate once, on page load, if we arrived with resume context
  useEffect(() => {
    if (hasResumeContext && !data && !loading) {
      generate({
        matchedTitle: state.matchedTitle!,
        skills:       state.skills!,
        summary:      state.summary ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = () => {
    if (!hasResumeContext) return;
    generate({
      matchedTitle: state.matchedTitle!,
      skills:       state.skills!,
      summary:      state.summary ?? "",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <div className="max-w-screen-lg mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <FiArrowLeft size={14} />
          Back
        </button>

        {/* Header */}
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
              color:    "var(--color-on-surface)",
            }}
          >
            Interview Preparation
          </h1>
          <p
            className="text-sm max-w-xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {hasResumeContext
              ? `Questions generated from your resume, tailored to ${state.matchedTitle}.`
              : "No resume data found. Upload your resume first to get personalized interview questions."}
          </p>
        </div>

        {/* No resume context — prompt to go analyze one */}
        {!hasResumeContext && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: "var(--color-surface-container)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-surface-container-high)" }}
            >
              <FiMessageSquare size={28} style={{ color: "var(--color-primary)" }} />
            </div>
            <h3
              className="headline text-xl font-bold mb-2"
              style={{ color: "var(--color-on-surface)" }}
            >
              No resume analyzed yet
            </h3>
            <p
              className="text-sm mb-6 max-w-sm mx-auto"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Upload your resume on the Resume Analyzer page first — we'll use your detected skills to generate relevant interview questions.
            </p>
            <button
              onClick={() => navigate("/resume")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              Go to Resume Analyzer
            </button>
          </div>
        )}

        {/* Loading */}
        {hasResumeContext && loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Generating your interview questions..." />
          </div>
        )}

        {/* Error */}
        {hasResumeContext && error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRegenerate} />
          </div>
        )}

        {/* Results */}
        {hasResumeContext && data && !loading && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                <FiRefreshCw size={13} />
                Regenerate questions
              </button>
            </div>
            <InterviewQuestions
              questions={data.questions}
              jobTitle={data.matchedTitle}
            />
          </>
        )}
      </div>
    </div>
  );
}