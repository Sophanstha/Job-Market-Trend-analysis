import { Navigate } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiUserCheck,
  FiFileText,
  FiShield,
  FiTrendingUp,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { useAdmin } from "../../hooks/useAdmin";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import UserFormModal from "../ui/UserFormModal"; // Adjust path if needed
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "../../store/hook";
import { useState } from "react";

const TrendTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const date = new Date(label as string);
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        background: "var(--color-surface-container-high)",
        border: "1px solid var(--color-outline)",
        color: "var(--color-on-surface)",
      }}
    >
      <p style={{ color: "var(--color-on-surface-variant)" }}>
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <p style={{ color: "var(--color-primary)", fontWeight: 700 }}>
        {payload[0]?.value} searches
      </p>
    </div>
  );
};

export default function Admin() {
  const { user } = useAppSelector((s) => s.auth);
  const {
    isAdmin,
    stats,
    users,
    searches,
    topCategories,
    searchTrend,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    actionLoading,
  } = useAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  // Guard — redirect non-admins away entirely
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

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
      {/* ── Modals ────────────────────────────────────────── */}

      {/* ── Create User Modal ────────────────────────────────── */}
      {showCreateModal && (
        <UserFormModal
          title="Add New User"
          initialData={{ name: "", email: "", password: "", role: "user" as const }}
          showPassword
          error={formError}
          loading={actionLoading}
          onCancel={() => setShowCreateModal(false)}
          onSubmit={async (form) => {
            try {
              await createUser({
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
              });
              setShowCreateModal(false);
            } catch (err: any) {
              setFormError(
                err?.response?.data?.message ?? "Failed to create user."
              );
            }
          }}
        />
      )}

      {/* ── Edit User Modal ──────────────────────────────────── */}
      {editingUser && (
        <UserFormModal
          title="Edit User"
          initialData={{
            name: editingUser.name,
            email: editingUser.email,
            password: "",
            role: editingUser.role,
          }}
          showPassword={false}
          error={formError}
          loading={actionLoading}
          onCancel={() => setEditingUser(null)}
          onSubmit={async (form) => {
            try {
              await updateUser(editingUser._id, {
                name: form.name,
                email: form.email,
                role: form.role,
              });
              setEditingUser(null);
            } catch (err: any) {
              setFormError(
                err?.response?.data?.message ?? "Failed to update user."
              );
            }
          }}
        />
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "var(--color-surface-container-highest)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="headline text-lg font-bold mb-2"
              style={{ color: "var(--color-on-surface)" }}
            >
              Delete this user?
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Their account will be deactivated and hidden from this list. They
              will no longer be able to log in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--color-surface-container-high)",
                  color: "var(--color-on-surface)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteUser(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--color-error)",
                  color: "var(--color-on-error)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-primary-container)" }}
          >
            <FiShield size={18} style={{ color: "var(--color-primary)" }} />
          </div>
          <p
            className="label-precision text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-primary)" }}
          >
            Admin Only
          </p>
        </div>
        <h1
          className="headline font-extrabold tracking-tighter mb-3"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            color: "var(--color-on-surface)",
          }}
        >
          Admin Dashboard
        </h1>
        <p
          className="text-sm mb-10"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Platform-wide statistics, user accounts, and search activity
        </p>

        {loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading admin data..." />
          </div>
        )}

        {error && <ErrorMessage message="Failed to load admin data" />}

        {stats && (
          <>
            {/* ── Stat cards ─────────────────────────────────── */}
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

            {/* ── Search trend — last 30 days ────────────────── */}
            <div
              className="rounded-2xl p-6 mb-8"
              style={{ background: "var(--color-surface-container)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <FiTrendingUp
                  size={18}
                  style={{ color: "var(--color-primary)" }}
                />
                <h2
                  className="headline text-lg font-bold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Search Activity — Last 30 Days
                </h2>
              </div>

              {searchTrend.length === 0 ? (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  No search data in this period
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={searchTrend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-outline)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      tick={{
                        fill: "var(--color-on-surface-variant)",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--color-on-surface-variant)",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={30}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="var(--color-primary)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "var(--color-primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* ── Registered users ────────────────────────── */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <FiUsers
                    size={18}
                    style={{ color: "var(--color-primary)" }}
                  />
                  <h2
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Registered Users
                  </h2>
                  <span
                    className="label-precision text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "var(--color-primary-container)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {users.length}
                  </span>
                  <button
                    onClick={() => {
                      setFormError("");
                      setShowCreateModal(true);
                    }}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                    }}
                  >
                    <FiPlus size={13} />
                    Add User
                  </button>
                </div>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {users.length === 0 ? (
                    <p
                      className="text-sm text-center py-8"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      No registered users yet
                    </p>
                  ) : (
                    users.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{
                          background: "var(--color-surface-container-high)",
                        }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold truncate flex items-center gap-2"
                            style={{ color: "var(--color-on-surface)" }}
                          >
                            {u.name}
                            {u.role === "admin" && (
                              <span
                                className="label-precision text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
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
                            {u.email} · Joined {formatDate(u.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="text-right">
                            <p
                              className="label-precision text-sm font-bold"
                              style={{ color: "var(--color-primary)" }}
                            >
                              {u.searchCount}
                            </p>
                            <p
                              className="text-[10px]"
                              style={{
                                color: "var(--color-on-surface-variant)",
                              }}
                            >
                              searches
                            </p>
                          </div>
                          {u.role !== "admin" && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setFormError("");
                                  setEditingUser(u);
                                }}
                                className="p-1.5 rounded-lg"
                                style={{
                                  color: "var(--color-on-surface-variant)",
                                }}
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(u._id)}
                                className="p-1.5 rounded-lg"
                                style={{ color: "var(--color-error)" }}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Top categories all-time ─────────────────── */}
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--color-surface-container)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <FiTrendingUp
                    size={18}
                    style={{ color: "var(--color-secondary)" }}
                  />
                  <h2
                    className="headline text-lg font-bold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Top Categories (All Time)
                  </h2>
                </div>
                <div className="space-y-3">
                  {topCategories.length === 0 ? (
                    <p
                      className="text-sm text-center py-8"
                      style={{ color: "var(--color-on-surface-variant)" }}
                    >
                      No search data yet
                    </p>
                  ) : (
                    topCategories.map((cat, idx) => {
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
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: "var(--color-primary)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ── Recent searches ──────────────────────────────── */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--color-surface-container)" }}
            >
              <div className="flex items-center gap-3 mb-5">
                <FiSearch
                  size={18}
                  style={{ color: "var(--color-tertiary)" }}
                />
                <h2
                  className="headline text-lg font-bold"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  Recent Searches (All Users)
                </h2>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {searches.length === 0 ? (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: "var(--color-on-surface-variant)" }}
                  >
                    No searches recorded yet
                  </p>
                ) : (
                  searches.map((s) => (
                    <div
                      key={s._id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: "var(--color-surface-container-high)",
                      }}
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
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}