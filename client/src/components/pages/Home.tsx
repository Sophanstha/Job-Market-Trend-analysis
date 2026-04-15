import React, { useState } from "react";
import {
  FiArrowRight,
  FiAward,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { UseSearch } from "../../hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../../hooks/useAnalytics";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import JobCard from "../ui/JobCard";

const TOPICS = [
  { label: "AI & Machine Learning", query: "ai", icon: <FiZap size={13} /> },
  {
    label: "Software Development",
    query: "software",
    icon: <FiTarget size={13} />,
  },
  {
    label: "Cybersecurity",
    query: "cybersecurity",
    icon: <FiAward size={13} />,
  },
  { label: "Cloud Computing", query: "cloud", icon: <FiZap size={13} /> },
  { label: "Data Science", query: "data", icon: <FiTarget size={13} /> },
  { label: "Healthcare", query: "healthcare", icon: <FiAward size={13} /> },
];

const Home = () => {
  const [query, setQuery] = useState("");
  const { search, error, loading } = UseSearch();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  //   console.log(analytics.data?.topDemandJobs)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    search(query.trim());
  };
  const handleTopicClick = (topicQuery: string) => {
    search(topicQuery);
  };
//   console.log(analytics.data?.trendingSearches[0].title);
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(192,193,255,0.12), transparent)",
          }}
        />
        <div className="max-w-screen-xl mx-auto px-6 pt-24 pb-20 relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs label-precision font-bold uppercase tracking-widest"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-secondary)",
                border: "1px solid rgba(78, 222, 163, 0.2)",
              }}
            >
              <FiTrendingUp size={11} />
              Real-time job market intelligence
            </span>
          </div>
          <h1
            className="headline text-center font-extrabold tracking-tighter leading-none mb-6"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              color: "var(--color-on-surface)",
            }}
          >
            Discover Your{" "}
            <span
              className="hero-gradient"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Career Demand
            </span>{" "}
            Score
          </h1>
          <p
            className="text-center text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Search any job title, skill, or industry — and instantly get a
            demand score, salary data, growth trends, and personalized career
            recommendations.
          </p>

          {/* Search bar */}

          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative mb-6 "
          >
            <FiSearch
              size={18}
              className="absolute left-5 top-6 pointer-events-none"
              style={{ color: "var(--color-on-surface-variant)" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try 'machine learning engineer' or 'data scientist'..."
              disabled={loading}
              className="w-full text-base pl-14 pr-36 py-5 rounded-2xl outline-none transition-all"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline-variant)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(192,193,255,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--color-outline-variant)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 bottom-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Analyze
                  <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Topic pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {TOPICS.map((topic) => (
              <button
                key={topic.query}
                onClick={() => handleTopicClick(topic.query)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  background: "var(--color-surface-container)",
                  color: "var(--color-on-surface-variant)",
                  border: "1px solid var(--color-outline-variant)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "var(--color-primary)";
                  el.style.color = "var(--color-primary)";
                  el.style.background = "var(--color-surface-container-high)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "var(--color-outline-variant)";
                  el.style.color = "var(--color-on-surface-variant)";
                  el.style.background = "var(--color-surface-container)";
                }}
              >
                {topic.icon}
                {topic.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────────── */}
      <section
        className="py-10"
        style={{
          borderTop: "1px solid rgba(70,69,84,0.2)",
          borderBottom: "1px solid rgba(70,69,84,0.2)",
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10+", label: "Job Categories" },
              { value: "15k+", label: "Job Postings Analyzed" },
              { value: "3", label: "AI Algorithms" },
              { value: "100%", label: "Free to Use" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="label-precision text-3xl font-bold mb-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* top demand job */}
      <section className="max-w-screen-xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p
              className="label-precision text-xs uppercase tracking-widest mb-2 font-bold"
              style={{ color: "var(--color-secondary)" }}
            >
              Top Performers
            </p>
            <h2
              className="headline text-3xl font-extrabold tracking-tight"
              style={{ color: "var(--color-on-surface)" }}
            >
              Highest Demand Careers
            </h2>
          </div>
          <button
            onClick={() => navigate("/analytics")}
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            View analytics
            <FiArrowRight size={14} />
          </button>
        </div>

        {analytics.isLoading && (
          <div className="py-28 flex justify-center ">
            <LoadingSpinner size="lg" text="loading market data" />
          </div>
        )}
        {analytics.isError && (
          <ErrorMessage
            onRetry={() => analytics.refetch()}
            message="failed to load the data"
          />
        )}

        {analytics.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.data.topDemandJobs?.map((job, index) => (
              <JobCard
                key={index}
                title={job.title}
                demandScore={job.demandScore}
                category={job.category}
                topSkills={[]}
                trend={job.trend as "rising" | "declining" | "stable"}
              />
            ))}
          </div>
        )}
      </section>

      {analytics.data && analytics.data.trendingSearches?.length > 0 && (
        <section
          className="py-16"
          style={{ background: "var(--color-surface-container-low)" }}
        >
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-8">
              <FiTrendingUp
                size={20}
                style={{ color: "var(--color-secondary)" }}
              />
              <h2
                className="headline text-2xl font-bold"
                style={{ color: "var(--color-on-surface)" }}
              >
                Trending This Week
              </h2>
              <span
                className="text-xs label-precision px-2 py-1 rounded-full"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "white",
                }}
              >
                {analytics.data.totalSearches} searches
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {analytics.data.trendingSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => search(item.title)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: "var(--color-surface-container)",
                    color: "var(--color-on-surface)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "var(--color-primary)";
                    el.style.color = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = "var(--color-outline-variant)";
                    el.style.color = "var(--color-on-surface)";
                  }}
                >
                  <FiTrendingUp
                    size={12}
                    style={{ color: "var(--color-secondary)" }}
                  />
                  {item.title}

                  <span
                    className="label-precision text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "var(--color-surface-container-high)",
                      color: "var(--color-on-surface-variant)",
                    }}
                  >
                    {item.searchCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-screen-xl mx-auto px-6 pb-20 mt-5">
        <div
          className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: "var(--color-surface-container)" }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(192,193,255,0.07), transparent)",
            }}
          />

          <h2
            className="headline text-3xl md:text-4xl font-extrabold tracking-tight mb-4 relative z-10"
            style={{ color: "var(--color-on-surface)" }}
          >
            Ready to find your demand score?
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto relative z-10"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Type any job title above or pick a topic to get started instantly.
            No sign up required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 hero-gradient"
              style={{ color: "var(--color-on-primary-fixed)" }}
            >
              <FiSearch size={15} />
              Search a career
            </button>
            <button
              onClick={() => navigate("/compare")}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "transparent",
                color: "var(--color-primary)",
                border: "1px solid var(--color-primary)",
              }}
            >
              <FiArrowRight size={15} />
              Compare two careers
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
