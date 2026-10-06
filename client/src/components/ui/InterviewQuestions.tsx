import { useState }        from "react";
import {
  FiCode, FiUsers, FiBriefcase, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import type { InterviewQuestionSet, InterviewQuestion } from "../../types";

interface Props {
  questions: InterviewQuestionSet;
  jobTitle:  string;
}

const SECTIONS: {
  key:   keyof InterviewQuestionSet;
  label: string;
  icon:  React.ReactNode;
  color: string;
}[] = [
  { key: "technical",    label: "Technical Questions",     icon: <FiCode size={16} />,      color: "var(--color-primary)" },
  { key: "behavioral",   label: "Behavioral Questions",    icon: <FiUsers size={16} />,      color: "var(--color-secondary)" },
  { key: "roleSpecific", label: "Role-Specific Questions", icon: <FiBriefcase size={16} />,  color: "var(--color-tertiary)" },
];

const QuestionCard = ({ q, color }: { q: InterviewQuestion; color: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all"
      style={{ background: "var(--color-surface-container-high)" }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-sm font-medium leading-relaxed"
          style={{ color: "var(--color-on-surface)" }}
        >
          {q.question}
        </p>
        <span style={{ color: "var(--color-on-surface-variant)", flexShrink: 0 }}>
          {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      </div>
      {open && (
        <div
          className="mt-3 pt-3 text-xs leading-relaxed"
          style={{
            borderTop: "1px solid var(--color-outline-variant)",
            color:     color,
          }}
        >
          💡 {q.hint}
        </div>
      )}
    </div>
  );
};

export default function InterviewQuestions({ questions, jobTitle }: Props) {
  return (
    <div
      className="rounded-2xl p-8"
      style={{ background: "var(--color-surface-container)" }}
    >
      <div className="mb-6">
        <p
          className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "var(--color-primary)" }}
        >
          AI-Generated
        </p>
        <h3
          className="headline text-xl font-bold"
          style={{ color: "var(--color-on-surface)" }}
        >
          Interview Prep — {jobTitle}
        </h3>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Questions tailored to your resume's actual skills. Click any question to reveal a hint.
        </p>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => {
          const items = questions[section.key];
          if (!items || items.length === 0) return null;

          return (
            <div key={section.key}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ color: section.color }}>{section.icon}</span>
                <h4
                  className="headline text-sm font-bold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {section.label}
                </h4>
                <span
                  className="label-precision text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--color-surface-container-high)",
                    color:      "var(--color-on-surface-variant)",
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((q, idx) => (
                  <QuestionCard key={idx} q={q} color={section.color} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}