import { useState }        from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { ForecastResult } from "../../types";
// import { ForecastResult } from "../../types";

interface Props {
  forecast: ForecastResult;
  jobTitle: string;
}

const CustomTooltip = ({ active, payload, label }: {
  active?:  boolean;
  payload?: { value: number }[];
  label?:   string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-2.5 text-xs"
      style={{
        background: "var(--color-surface-container-high)",
        border:     "1px solid var(--color-outline)",
      }}
    >
      <p className="font-bold label-precision mb-1" style={{ color: "var(--color-on-surface)" }}>
        {label}
      </p>
      <p style={{ color: "var(--color-primary)" }}>
        Score: {payload[0]?.value}
      </p>
    </div>
  );
};

export default function MarketForecast({ forecast, jobTitle }: Props) {
  const [tab, setTab] = useState<"present" | "future">("present");

  const { present, future } = forecast;

  const trendHex =
    future.trend2030 === "surging"    ? "#30D158" :
    future.trend2030 === "growing"    ? "#32D9FA" :
    future.trend2030 === "plateauing" ? "#FF9F0A" :
                                        "#FF453A";

  const trendColor =
    future.trend2030 === "surging"    ? "var(--color-secondary)" :
    future.trend2030 === "growing"    ? "var(--color-primary)"   :
    future.trend2030 === "plateauing" ? "var(--color-tertiary)"  :
                                        "var(--color-error)";

  const trendIcon =
    future.trend2030 === "surging"    ? "🚀" :
    future.trend2030 === "growing"    ? "📈" :
    future.trend2030 === "plateauing" ? "➡️" : "📉";

  const presentChartData = present.data.map((p) => ({
    year:  p.year.toString(),
    score: p.score,
  }));

  const futureChartData = future.data.map((p) => ({
    year:  p.year.toString(),
    score: p.score,
  }));

  return (
    <div
      className="rounded-2xl p-8"
      style={{ background: "var(--color-surface-container)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          className="headline text-lg font-bold mb-1"
          style={{ color: "var(--color-on-surface)" }}
        >
          Market Trend Analysis — {jobTitle}
        </h3>
        <p
          className="text-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Compare present-day demand against AI-projected future trends
        </p>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex p-1 rounded-xl mb-6"
        style={{ background: "var(--color-surface-container-high)" }}
      >
        <button
          onClick={() => setTab("present")}
          className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background: tab === "present" ? "var(--color-primary)" : "transparent",
            color:      tab === "present" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
          }}
        >
          📊 Present Market (2018–2025)
        </button>
        <button
          onClick={() => setTab("future")}
          className="px-5 py-2 rounded-lg text-sm font-bold transition-all"
          style={{
            background: tab === "future" ? "var(--color-primary)" : "transparent",
            color:      tab === "future" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
          }}
        >
          🔮 Future Market (2026–2030)
        </button>
      </div>

      {/* ── PRESENT TAB ─────────────────────────────────────── */}
      {tab === "present" && (
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={presentChartData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--color-on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--color-on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Current Score ({present.currentYear})
              </p>
              <p className="label-precision text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                {present.currentScore}
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Total Growth
              </p>
              <p className="label-precision text-2xl font-bold" style={{ color: "var(--color-secondary)" }}>
                +{present.totalGrowth}%
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Current Status
              </p>
              <p className="label-precision text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                {present.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FUTURE TAB ──────────────────────────────────────── */}
      {tab === "future" && (
        <div>
          <div
            className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold label-precision w-fit"
            style={{
              background: "var(--color-surface-container-high)",
              color:      trendColor,
            }}
          >
            {trendIcon} Projected to be {future.trend2030} through 2030
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={futureChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--color-on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--color-on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill={trendHex} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                2030 Forecast
              </p>
              <p className="label-precision text-2xl font-bold" style={{ color: trendColor }}>
                {future.score2030}
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Peak Year
              </p>
              <p className="label-precision text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                {future.peakYear}
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-surface-container-high)" }}>
              <p className="label-precision text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Annual Growth
              </p>
              <p className="label-precision text-2xl font-bold" style={{ color: future.cagr > 0 ? "var(--color-secondary)" : "var(--color-error)" }}>
                {future.cagr > 0 ? "+" : ""}{future.cagr}%
              </p>
            </div>
          </div>

          {/* Confidence legend */}
          <div className="flex items-center gap-2 mb-6">
            {(["high", "medium", "low"] as const).map((c) => (
              <span
                key={c}
                className="label-precision text-[9px] font-bold px-2 py-1 rounded-full uppercase"
                style={{
                  background:
                    c === "high"   ? "rgba(48,209,88,0.15)"  :
                    c === "medium" ? "rgba(255,159,10,0.15)" :
                                     "rgba(255,69,58,0.15)",
                  color:
                    c === "high"   ? "#30D158" :
                    c === "medium" ? "#FF9F0A" :
                                     "#FF453A",
                }}
              >
                {c}
              </span>
            ))}
            <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
              2026–27 high · 2028 medium · 2029–30 low confidence
            </span>
          </div>

          {/* Insight */}
          <div
            className="rounded-xl p-4"
            style={{
              background:  "var(--color-surface-container-high)",
              borderLeft:  `3px solid ${trendColor}`,
            }}
          >
            <p className="label-precision text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: trendColor }}>
              Future Market Insight
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
              {future.insight}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}