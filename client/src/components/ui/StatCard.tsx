import React, { type ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  subText?: string;
  icons?: ReactNode;
  accent?: "primary" | "secondary" | "tertiary" | "error";
}

const accents = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  tertiary: "var(--color-tertiary)",
  error: "var(--color-error)",
};

const StatCard = ({
  label,
  value,
  subText,
  icons,
  accent = "primary",
}: Props) => {
  const color = accents[accent];
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--color-surface-container-low)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <p
        className="label-precision text-[10px] uppercase tracking-widest mb-2"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        {label}
      </p>
      <h4
        className="label-precision text-3xl font-bold"
        style={{ color: "var(--color-on-surface)" }}
      >
        {value}
      </h4>
      {
        subText && (
        <p
          className="text-[10px] mt-2 flex items-center gap-1 font-medium"
          style={{ color }}
        >
          {icons && <span className="text-sm">{icons}</span>}
          {subText}
        </p>
        )
      }
    </div>
  );
};

export default StatCard;
