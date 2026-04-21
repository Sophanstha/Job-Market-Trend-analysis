import React from "react";
import { useAnalytics } from "../../hooks/useAnalytics";
import { UseSearch } from "../../hooks/useSearch";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { FiAward, FiBarChart2, FiSearch, FiTrendingUp } from "react-icons/fi";
import TrendBadge from "../ui/TrendBadge";

const Analytics = () => {
  const { data, error, isLoading, isError, refetch } = useAnalytics();
  const { search } = UseSearch();
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto py-10 px-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-10">
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            Market Intelligence
          </p>
          <h1
            className="headline font-extrabold tracking-tighter mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Analytics Dashboard
          </h1>

          <p
            className="text-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Real-time insights from all user searches and job market data
          </p>
        </div>
        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="loading analying ............" />
          </div>
        )}
        {isError && <ErrorMessage message={error.message} onRetry={refetch} />}
        {data && (
          <div>
            {/* ── Stat cards ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                {
                  label: "Total Searches",
                  value: data.totalSearches.toLocaleString(),
                  sub: data.period,
                  icon: <FiSearch size={18} />,
                  color: "var(--color-primary)",
                },
                {
                  label: "Trending Topics",
                  value: data.trendingSearches.length.toString(),
                  sub: "Active this week",
                  icon: <FiTrendingUp size={18} />,
                  color: "var(--color-secondary)",
                },
                {
                  label: "Top Categories",
                  value: data.topDemandJobs.length.toString(),
                  sub: "Tracked markets",
                  icon: <FiBarChart2 size={18} />,
                  color: "var(--color-tertiary)",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 flex items-center gap-4"
                  style={{ background: "var(--color-surface-container)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "var(--color-surface-container-high)",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p
                      className="label-precision text-2xl font-black"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      {stat.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* trading search */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiTrendingUp
                    size={18}
                    style={{ color: "var(--color-secondary)" }}
                  />
                  <h2
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Trending Search
                  </h2>
                  <span
                    className="label-precision font-semibold text-xs px-2 py-1 rounded-full ml-auto"
                    style={{
                      background: "var(--color-secondary-container)",
                      color: "black",
                    }}
                  >
                    {data.period}
                  </span>
                </div>
                {data.trendingSearches.length === 0 ? (
                  <>
                    <p
                      className="text-sm text-center py-8"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      No searches recorded yet this week
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {data.trendingSearches.map((data, idx) => (
                      <button
                        key={idx}
                        onClick={() => search(data.title)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                        style={{
                          background: "var(--color-surface-container-high)",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--color-surface-bright)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background =
                            "var(--color-surface-container-high)";
                        }}
                      >
                        {/* Rank */}
                        <span
                          className="label-precision text-xs font-black w-6 text-center flex-shrink-0 "
                          style={{
                            color:
                              idx === 0
                                ? "var(--color-primary)"
                                : idx === 1
                                  ? "var(--color-secondary)"
                                  : idx === 2
                                    ? "var(--color-tertiary)"
                                    : "var(--color-on-surface-variant)",
                          }}
                        >
                          {idx + 1}
                        </span>
                        {/* Title */}
                        <p
                          className="flex-1 text-sm font-medium truncate"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {data.title}
                        </p>
                        {/* count bridge */}
                        <span
                          className="label-precsion text-xs py-1 gap-2 px-2 rounded-2xl flex"
                          style={{
                            background: "var(--color-primary-container)",
                            color: "var(--color-primary)",
                          }}
                        >
                          {data.searchCount} Searches
                          <FiSearch
                            size={12}
                            style={{ color: "var(--color-on-surface-variant)" }}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* top deman djob */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiAward
                    size={18}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <h2
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Top Demand Jobs
                  </h2>
                </div>
                <div className="space-y-3">
                  {data.topDemandJobs.map((item, idx) => {
                    const barColor =
                      item.demandScore >= 65
                        ? "var(--color-secondary)"
                        : item.demandScore >= 50
                          ? "var(--color-primary)"
                          : item.demandScore >= 38
                            ? "var(--color-tertiary)"
                            : "var(--color-error)";
                    return (
                      <button
                        key={item.category}
                        onClick={() => search(item.title)}
                        className="w-full text-left transition-all"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="label-precision text-xs font-black w-5"
                              style={{
                                color: "var(--color-on-surface-variant)",
                              }}
                            >
                              {idx + 1}
                            </span>
                            <p
                              className="text-sm font-medium"
                              style={{ color: "var(--color-on-surface)" }}
                            >
                              {item.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendBadge
                              trend={
                                item.trend as "rising" | "declining" | "stable"
                              }
                              sizes="md"
                            />
                            <span
                              className="label-precision text-sm font-black"
                              style={{ color: barColor }}
                            >
                              {item.demandScore}
                            </span>
                          </div>
                        </div>
                        {/* Demand bar */}
                        <div
                          className="h-1.5 rounded-full overflow-hidden ml-5"
                          style={{
                            background: "var(--color-surface-container-high)",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.demandScore}%`,
                              background: barColor,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
