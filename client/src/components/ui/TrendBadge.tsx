import { FiMinus, FiTrendingDown, FiTrendingUp } from "react-icons/fi";

interface Props {
  trend: "rising" | "declining" | "stable";
  sizes?: "md" | "sm";
}
const config = {
  rising: {
    label: "Rising",
    icon: <FiTrendingUp />,
    bg: "green",
    color: "var(--color-on-secondary)",
  },
  declining: {
    label: "Declining",
    icon: <FiTrendingDown />,
    bg: "var(--color-error-container)",
    color: "var(--color-on-error-container)",
  },
  stable: {
    label: "Stable",
    icon: <FiMinus />,
    bg: "var(--color-tertiary-container)",
    color: "var(--color-on-tertiary)",
  },
};
const TrendBadge = ({ sizes = "md", trend }: Props) => {
  const currentTrend = config[trend];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold label-precision uppercase tracking-wider ${
        sizes === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
      style={{ background: currentTrend.bg, color: currentTrend.color }}
    >
      <span className="text-sm">{currentTrend.icon}</span>
      {currentTrend.label}
    </span>
  );
};

export default TrendBadge;
