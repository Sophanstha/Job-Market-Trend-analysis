import { useState } from "react";
import {
  FiCode,
  FiUsers,
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import type { InterviewQuestionSet, InterviewQuestion } from "../../types";

interface Props {
  questions: InterviewQuestionSet;
  jobTitle: string;
}

const SECTIONS: {
  key: keyof InterviewQuestionSet;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    key: "technical",
    label: "Technical Architecture & Implementation",
    icon: <FiCode size={15} />,
    color: "var(--color-primary)",
  },
  {
    key: "behavioral",
    label: "Behavioral & Situational (STAR)",
    icon: <FiUsers size={15} />,
    color: "var(--color-secondary)",
  },
  {
    key: "roleSpecific",
    label: "Domain Strategy & Production Scenarios",
    icon: <FiBriefcase size={15} />,
    color: "var(--color-tertiary)",
  },
];

const QuestionCard = ({
  q,
  color,
  index,
}: {
  q: InterviewQuestion;
  color: string;
  index: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-lg p-4 cursor-pointer transition-all border hover:border-[var(--color-outline)]"
      style={{
        background: "var(--color-surface-container-low)",
        borderColor: "var(--color-outline-variant)",
      }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="label-precision font-mono text-[11px] font-bold shrink-0 mt-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <p
            className="text-xs md:text-sm font-medium leading-relaxed"
            style={{ color: "var(--color-on-surface)" }}
          >
            {q.question}
          </p>
        </div>
        <span
          style={{ color: "var(--color-on-surface-variant)", flexShrink: 0 }}
          className="mt-0.5"
        >
          {open ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
        </span>
      </div>
      {open && (
        <div
          className="mt-3 pt-3 text-xs leading-relaxed border-t font-mono"
          style={{
            borderColor: "var(--color-outline-variant)",
            color: "var(--color-on-surface)",
          }}
        >
          <span
            className="label-precision text-[10px] uppercase font-bold tracking-wider block mb-1"
            style={{ color }}
          >
            Evaluation Rubric Focus
          </span>
          {q.hint}
        </div>
      )}
    </div>
  );
};

export default function InterviewQuestions({ questions, jobTitle }: Props) {
  return (
    <div
      className="rounded-xl p-6 md:p-8 border"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-outline)",
      }}
    >
      <div className="mb-8 pb-5 border-b border-[var(--color-outline-variant)]">
        <p
          className="label-precision font-mono text-[11px] font-bold uppercase tracking-wider mb-1"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Question Repository
        </p>
        <h3
          className="headline text-lg font-bold"
          style={{ color: "var(--color-on-surface)" }}
        >
          {jobTitle} — Competency Matrix
        </h3>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Structured question set indexed by technical depth, communication, and domain ownership.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const items = questions[section.key];
          if (!items || items.length === 0) return null;

          return (
            <div key={section.key}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: section.color }}>{section.icon}</span>
                <h4
                  className="text-xs font-bold uppercase tracking-wider label-precision font-mono"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {section.label}
                </h4>
                <span
                  className="label-precision font-mono text-[10px] px-2 py-0.2 rounded"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    index={idx}
                    q={q}
                    color={section.color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}