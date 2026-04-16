interface Props {
  skill:    string;
  variant?: "default" | "primary" | "secondary";
}

const variants = {
  default:   { bg: "var(--color-surface-container)",      color: "var(--color-on-surface-variant)" },
  primary:   { bg: "var(--color-surface-container)",      color: "var(--color-primary)"            },
  secondary: { bg: "var(--color-secondary-container)",    color: "var(--color-on-secondary)"       },
};

export default function SkillTag({ skill, variant = "default" }: Props) {
  const v = variants[variant];
  return (
    <span
      className="inline-block px-3 py-1.5 rounded-full text-sm font-medium cursor-default transition-all"
      style={{ background: v.bg, color: v.color }}
    >
      {skill}
    </span>
  );
}