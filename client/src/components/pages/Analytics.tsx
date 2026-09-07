import { useState } from "react";
import { useAnalytics } from "../../hooks/useAnalytics";
// import { useSearch } from "../../hooks/useSearch";
import { useAdmin } from "../../hooks/useAdmin";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import {
  FiAward,
  FiBarChart2,
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiFileText,
  FiUserCheck,
} from "react-icons/fi";
import TrendBadge from "../ui/TrendBadge";
import { UseSearch } from "../../hooks/useSearch";

const Analytics = () => {
  const { data, error, isLoading, isError, refetch } = useAnalytics();
  const { search } = UseSearch();
  const {
    isAdmin,
    stats,
    users,
    searches,
    topCategories,
    loading: adminLoading,
    error: adminError,
  } = useAdmin();

  const [tab, setTab] = useState<"public" | "admin">("public");

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto py-10 px-6">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-8">
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

        {/* ── Tabs — Admin tab only shows for admins ──────────── */}
        {isAdmin && (
          <div
            className="inline-flex p-1 rounded-xl mb-8"
            style={{ background: "var(--color-surface-container)" }}
          >
            <button
              onClick={() => setTab("public")}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              style={{
                background:
                  tab === "public" ? "var(--color-primary)" : "transparent",
                color:
                  tab === "public"
                    ? "var(--color-on-primary)"
                    : "var(--color-on-surface-variant)",
              }}
            >
              <FiBarChart2 size={14} />
              Public Analytics
            </button>
            <button
              onClick={() => setTab("admin")}
              className="px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
              style={{
                background:
                  tab === "admin" ? "var(--color-primary)" : "transparent",
                color:
                  tab === "admin"
                    ? "var(--color-on-primary)"
                    : "var(--color-on-surface-variant)",
              }}
            >
              <FiShield size={14} />
              Admin Panel
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* PUBLIC ANALYTICS TAB                                    */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "public" && (
          <>
            {isLoading && (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" text="Loading analytics..." />
              </div>
            )}

            {isError && (
              <ErrorMessage message={error?.message ?? "Failed to load analytics data"} onRetry={refetch} />
            )}

            {data && (
              <div>
                {/* ── Stat cards ───────────────────────────────── */}
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
                  {/* trending search */}
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
                          color: "var(--color-secondary)",
                        }}
                      >
                        {data.period}
                      </span>
                    </div>
                    {data.trendingSearches.length === 0 ? (
                      <p
                        className="text-sm text-center py-8"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        No searches recorded yet this week
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {data.trendingSearches.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => search(item.title)}
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
                              className="label-precision text-xs font-black w-6 text-center flex-shrink-0"
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
                              {item.title}
                            </p>
                            {/* count badge */}
                            <span
                              className="label-precision text-xs py-1 gap-2 px-2 rounded-2xl flex items-center flex-shrink-0"
                              style={{
                                background: "var(--color-primary-container)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {item.searchCount} searches
                              <FiSearch
                                size={12}
                                style={{ color: "var(--color-primary)" }}
                              />
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* top demand jobs */}
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
                            onClick={() => search(item.category)}
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
                                    item.trend as
                                      | "rising"
                                      | "declining"
                                      | "stable"
                                  }
        
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
                                background:
                                  "var(--color-surface-container-high)",
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
          </>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ADMIN PANEL TAB — admins only                          */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "admin" && isAdmin && (
          <>
            {adminLoading && (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" text="Loading admin data..." />
              </div>
            )}

            {adminError && <ErrorMessage message="Failed to load admin data" />}

            {stats && (
              <>
                {/* Admin stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[
                    {
                      label: "Total Users",
                      value: stats.totalUsers.toLocaleString(),
                      sub: `+${stats.newUsersThisWeek} this week`,
                      icon: <FiUsers size={18} />,
                      color: "var(--color-primary)",
                    },
                    {
                      label: "Total Searches",
                      value: stats.totalSearches.toLocaleString(),
                      sub: `+${stats.searchesThisWeek} this week`,
                      icon: <FiSearch size={18} />,
                      color: "var(--color-secondary)",
                    },
                    {
                      label: "Registered Searches",
                      value: stats.registeredSearches.toLocaleString(),
                      sub: "By logged-in users",
                      icon: <FiUserCheck size={18} />,
                      color: "var(--color-tertiary)",
                    },
                    {
                      label: "Anonymous Searches",
                      value: stats.anonymousSearches.toLocaleString(),
                      sub: "Guest searches",
                      icon: <FiFileText size={18} />,
                      color: "var(--color-on-surface-variant)",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl p-5"
                      style={{
                        background: "var(--color-surface-container)",
                        borderLeft: `4px solid ${stat.color}`,
                      }}
                    >
                      <p
                        className="label-precision text-[10px] uppercase tracking-widest mb-2"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        {stat.label}
                      </p>
                      <p
                        className="label-precision text-3xl font-bold mb-1"
                        style={{ color: "var(--color-on-surface)" }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: stat.color }}
                      >
                        {stat.sub}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Recent users table */}
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "var(--color-surface-container)" }}
                  >
                    <h2
                      className="headline text-lg font-bold mb-5"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      Registered Users
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {users.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: "var(--color-surface-container-high)" }}
                        >
                          <div className="min-w-0">
                            <p
                              className="text-sm font-bold truncate"
                              style={{ color: "var(--color-on-surface)" }}
                            >
                              {u.name}
                              {u.role === "admin" && (
                                <span
                                  className="ml-2 label-precision text-[9px] px-1.5 py-0.5 rounded"
                                  style={{
                                    background: "var(--color-primary-container)",
                                    color: "var(--color-primary)",
                                  }}
                                >
                                  ADMIN
                                </span>
                              )}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{ color: "var(--color-on-surface-variant)" }}
                            >
                              {u.email}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p
                              className="label-precision text-sm font-bold"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {u.searchCount}
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: "var(--color-on-surface-variant)" }}
                            >
                              searches
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All-time top categories */}
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "var(--color-surface-container)" }}
                  >
                    <h2
                      className="headline text-lg font-bold mb-5"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      Top Categories (All Time)
                    </h2>
                    <div className="space-y-3">
                      {topCategories.map((cat, idx) => {
                        const maxCount = topCategories[0]?.searchCount ?? 1;
                        const pct = Math.round(
                          (cat.searchCount / maxCount) * 100
                        );
                        return (
                          <div key={cat.title}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span style={{ color: "var(--color-on-surface)" }}>
                                {idx + 1}. {cat.title}
                              </span>
                              <span
                                className="label-precision font-bold"
                                style={{ color: "var(--color-primary)" }}
                              >
                                {cat.searchCount}
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{
                                background: "var(--color-surface-container-high)",
                              }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background: "var(--color-primary)",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent searches across all users */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: "var(--color-surface-container)" }}
                >
                  <h2
                    className="headline text-lg font-bold mb-5"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Recent Searches (All Users)
                  </h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searches.map((s) => (
                      <div
                        key={s._id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: "var(--color-surface-container-high)" }}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-bold truncate"
                            style={{ color: "var(--color-on-surface)" }}
                          >
                            {s.query}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--color-on-surface-variant)" }}
                          >
                            {s.user.name}
                            {s.user.email ? ` · ${s.user.email}` : ""} →{" "}
                            {s.topResult}
                          </p>
                        </div>
                        <p
                          className="text-[10px] flex-shrink-0 ml-3"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {formatDate(s.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;