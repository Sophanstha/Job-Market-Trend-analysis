import React, { useState } from "react";
import { UseSearch } from "../../hooks/useSearch";
import { useHistory } from "../../hooks/useHistory";
import {
  FiArrowRight,
  FiClock,
  FiInbox,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import { Link } from "react-router-dom";
import { retry } from "@reduxjs/toolkit/query";

const History = () => {
  const { search } = UseSearch();
  const { history, loading, error, deleteItem, deleteloading } = useHistory();
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const handleDelete = (id: string) => {
    // console.log("hii")
    deleteItem(id);
  };
  const handleDeleteAll = async () => {
    if (!confirmDeleteAll) {
      setConfirmDeleteAll(true);
      setTimeout(() => {
        setConfirmDeleteAll(false);
      }, 3000);
      return;
    }
    await Promise.all(history.map((item)=>deleteItem(item._id)))
    setConfirmDeleteAll(false)
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p
              className="label-precision text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              Your Activity
            </p>
            <h1
              className="headline font-extrabold tracking-tighter mb-2"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: "var(--color-on-surface)",
              }}
            >
              Search History
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              All your past career searches in one place
            </p>
          </div>
          {/* count bridges */}
          {history.length > 0 && (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl label-precision text-sm font-bold"
                style={{
                  background: "var(--color-surface-container)",
                  color: "var(--color-primary)",
                }}
              >
                <FiClock size={14} />
                {history.length} searches
              </div>

              <button
                onClick={handleDeleteAll}
                disabled={deleteloading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                style={{
                  background: "var(--color-error-container)",
                  color: "var(--color-on-error-container)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--color-error)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--color-on-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--color-error-container)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "var(--color-on-error-container)";
                }}
              >
                <FiTrash2 size={14} />
                {confirmDeleteAll ? "Confirm delete all?" : "Delete All"}
              </button>
            </div>
          )}
        </div>
        {loading && (
          <div className="flex items-center py-20">
            <LoadingSpinner size="lg" text="loading the history data" />
          </div>
        )}
        {/* error message */}
        {error && <ErrorMessage message={error} />}
        {/* ── Empty state ─────────────────────────────────────── */}
        {!loading && !error && history.length === 0 && (
          <div
            className="rounded-2xl p-20 text-center"
            style={{ background: "var(--color-surface-container)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-surface-container-high)" }}
            >
              <FiInbox
                size={28}
                style={{ color: "var(--color-on-surface-variant)" }}
              />
            </div>
            <h3
              className="headline text-xl font-bold mb-2"
              style={{ color: "var(--color-on-surface)" }}
            >
              No searches yet
            </h3>
            <p
              className="text-sm mb-6 max-w-xs mx-auto"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Your search history will appear here after you analyze a career on
              the home page.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
            >
              <FiSearch size={14} />
              Start Searching
            </Link>
          </div>
        )}
        {/* history List */}
        {!loading && history.length > 0 && (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 flex items-center gap-4 transition-all group"
                style={{
                  background: "var(--color-surface-container)",
                  border: "1px solid var(--color-outline-variant)",
                  animationDelay: `${idx * 50}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(50,217,250,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--color-outline-variant)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--color-surface-container-high)" }}
                >
                  <FiSearch
                    size={16}
                    onClick={() => search(item.query)}
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p
                      className="font-bold text-sm truncate"
                      style={{ color: "var(--color-on-surface)" }}
                    >
                      {item.query}
                    </p>
                    <span
                      className="label-precision text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: "var(--color-primary-container)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {item.resultsCount} results
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      style={{ color: "var(--color-on-surface-variant)" }}
                      className="text-xs truncate"
                    >
                      Top Result:{" "}
                      <span style={{ color: "var(--color-primary)" }}>
                        {item.topResult}
                      </span>
                    </p>
                    <span
                      className="text-[10px] label-precision flex-shrink-0"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      <FiClock size={10} className="inline mr-1" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>
                {/* actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => search(item.query)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
                    style={{
                      background: "var(--color-surface-container-high)",
                      color: "var(--color-primary)",
                    }}
                  >
                    Search again
                    <FiArrowRight size={11} />
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteloading}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
                    style={{
                      background: "var(--color-error-container)",
                      color: "var(--color-on-error-container)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-error)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "var(--color-on-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-error-container)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "var(--color-on-error-container)";
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
