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
import TrendBadge from "../ui/TrendBadge";
import { motion } from "framer-motion";

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

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
};

const Home = () => {
  const [query, setQuery] = useState("");
  const { search, error, loading } = UseSearch();
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    search(query.trim());
  };

  const handleTopicClick = (topicQuery: string) => {
    search(topicQuery);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      {/* ── HERO SECTION (Page Load Animation) ───────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(192,193,255,0.12), transparent)",
          }}
        />
        <div className="max-w-screen-xl mx-auto px-6 pt-24 pb-20 relative z-10">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
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
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Search any job title, skill, or industry — and instantly get a
            demand score, salary data, growth trends, and personalized career
            recommendations.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto relative mb-6"
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
          </motion.form>

          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Topic pills - Staggered entrance */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3"
          >
            {TOPICS.map((topic) => (
              <motion.button
                key={topic.query}
                variants={fadeInUp}
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
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP (Scroll-Triggered Stagger) ─────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
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
              <motion.div key={stat.label} variants={fadeInUp}>
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
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── RESULT PREVIEW SECTION (Scroll-Triggered) ──────────── */}
      {analytics.data && analytics.data.topDemandJobs[0] && (() => {
        const topJob = analytics.data.topDemandJobs[0]!;
        const score = topJob.demandScore;

        const scoreColor =
          score >= 65 ? "var(--color-secondary)" :
          score >= 50 ? "var(--color-primary)"   :
          score >= 38 ? "var(--color-tertiary)"  :
                        "var(--color-error)";

        const scoreHex =
          score >= 65 ? "#30D158" :
          score >= 50 ? "#32D9FA" :
          score >= 38 ? "#FF9F0A" :
                        "#FF453A";

        const scoreLabel =
          score >= 65 ? "Very High Demand" :
          score >= 50 ? "High Demand"      :
          score >= 38 ? "Moderate Demand"  :
          score >= 25 ? "Low Demand"       :
                        "Very Low Demand";

        const circumference = 2 * Math.PI * 75;
        const offset = circumference * (1 - score / 100);

        return (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
            className="py-16"
            style={{
              background: "var(--color-surface-container-low)",
              borderTop: "1px solid rgba(50,217,250,0.08)",
              borderBottom: "1px solid rgba(50,217,250,0.08)",
            }}
          >
            <div className="max-w-screen-xl mx-auto px-6">
              <p
                className="label-precision text-xs font-bold uppercase tracking-widest mb-8"
                style={{ color: "var(--color-primary)" }}
              >
                What a search result looks like
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Demand Ring */}
                <div className="md:col-span-3 flex flex-col items-center gap-4">
                  <div className="relative w-44 h-44">
                    <svg
                      width="176"
                      height="176"
                      viewBox="0 0 180 180"
                      style={{ transform: "rotate(-90deg)" }}
                    >
                      <circle
                        cx="90" cy="90" r="75"
                        fill="none"
                        stroke="#2C2C2E"
                        strokeWidth="12"
                      />
                      <circle
                        cx="90" cy="90" r="75"
                        fill="none"
                        stroke={scoreHex}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="label-precision text-4xl font-black"
                        style={{ color: scoreColor }}
                      >
                        {score}
                      </span>
                      <span
                        className="label-precision text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--color-on-surface-variant)" }}
                      >
                        Score
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p
                      className="headline text-lg font-bold"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {scoreLabel}
                    </p>
                    <TrendBadge trend={topJob.trend as "rising" | "declining" | "stable"} sizes="sm" />
                  </div>
                </div>

                {/* Right content */}
                <div className="md:col-span-9">
                  <h3
                    className="headline text-2xl font-bold mb-6"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {topJob.title} — full breakdown
                  </h3>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      {
                        label: "Avg Salary",
                        value: `$${Math.round(topJob.demandScore * 1.3)}k`,
                        accent: "var(--color-primary)",
                      },
                      {
                        label: "Growth Rate",
                        value: `+${Math.round(topJob.demandScore * 0.4)}%`,
                        accent: "var(--color-secondary)",
                      },
                      {
                        label: "Demand Score",
                        value: `${topJob.demandScore}/100`,
                        accent: "var(--color-tertiary)",
                      },
                      {
                        label: "Market Trend",
                        value: topJob.trend.charAt(0).toUpperCase() + topJob.trend.slice(1),
                        accent: "var(--color-on-surface-variant)",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl p-4"
                        style={{
                          background: "var(--color-surface-container)",
                          borderLeft: `4px solid ${stat.accent}`,
                        }}
                      >
                        <p
                          className="label-precision text-[10px] uppercase tracking-widest mb-2"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {stat.label}
                        </p>
                        <p
                          className="label-precision text-2xl font-black"
                          style={{ color: "var(--color-on-surface)" }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Animated Score Bars */}
                  <div className="space-y-4">
                    {[
                      {
                        label: "Growth potential",
                        score: Math.min(Math.round(topJob.demandScore * 1.05), 100),
                        color: "var(--color-primary)",
                      },
                      {
                        label: "Job availability",
                        score: Math.round(topJob.demandScore * 0.75),
                        color: "var(--color-secondary)",
                      },
                      {
                        label: "Salary premium",
                        score: Math.round(topJob.demandScore * 0.95),
                        color: "var(--color-tertiary)",
                      },
                      {
                        label: "Remote feasibility",
                        score: Math.round(topJob.demandScore * 0.80),
                        color: "var(--color-on-surface-variant)",
                      },
                    ].map((bar) => (
                      <div key={bar.label} className="flex items-center gap-4">
                        <span
                          className="text-sm w-36 flex-shrink-0"
                          style={{ color: "var(--color-on-surface-variant)" }}
                        >
                          {bar.label}
                        </span>
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "var(--color-surface-container-high)" }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bar.score}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: bar.color }}
                          />
                        </div>
                        <span
                          className="label-precision text-sm font-bold w-8 text-right"
                          style={{ color: bar.color }}
                        >
                          {bar.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => search(topJob.category)}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 text-sm font-bold transition-all"
                    style={{ color: scoreColor }}
                  >
                    Analyze {topJob.title} in full detail →
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        );
      })()}

      {/* ── TOP PERFORMERS GRID (Staggered Scroll Reveal) ────────── */}
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
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {analytics.data.topDemandJobs?.map((job, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <JobCard
                  title={job.title}
                  demandScore={job.demandScore}
                  category={job.category}
                  topSkills={[]}
                  trend={job.trend as "rising" | "declining" | "stable"}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* ── TRENDING SEARCHES ──────────────────────────────────── */}
      {analytics.data && analytics.data.trendingSearches?.length > 0 && (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
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
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap gap-3"
            >
              {analytics.data.trendingSearches.map((item, idx) => (
                <motion.button
                  key={idx}
                  variants={fadeInUp}
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
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* ── FOOTER CTA (Scale In on Scroll) ────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-6 pb-20 mt-5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={scaleIn}
          className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: "var(--color-surface-container)" }}
        >
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
        </motion.div>
      </section>
    </div>
  );
};

export default Home;