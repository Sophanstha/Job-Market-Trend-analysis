import { useState } from "react";
import { FiX } from "react-icons/fi";

interface FormData {
  name:     string;
  email:    string;
  password: string;
  role:     "user" | "admin";
}

interface Props {
  title:        string;
  initialData:  FormData;
  showPassword: boolean;
  error:        string;
  loading:      boolean;
  onCancel:     () => void;
  onSubmit:     (form: FormData) => void;
}

export default function UserFormModal({
  title, initialData, showPassword, error, loading, onCancel, onSubmit,
}: Props) {
  const [form, setForm] = useState<FormData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full"
        style={{ background: "var(--color-surface-container-highest)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="headline text-lg font-bold" style={{ color: "var(--color-on-surface)" }}>
            {title}
          </h3>
          <button onClick={onCancel} style={{ color: "var(--color-on-surface-variant)" }}>
            <FiX size={18} />
          </button>
        </div>

        {error && (
          <div
            className="rounded-lg p-3 text-xs font-medium mb-4"
            style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-surface-container-high)",
                color:      "var(--color-on-surface)",
                border:     "1px solid var(--color-outline-variant)",
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-surface-container-high)",
                color:      "var(--color-on-surface)",
                border:     "1px solid var(--color-outline-variant)",
              }}
            />
          </div>

          {showPassword && (
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--color-surface-container-high)",
                  color:      "var(--color-on-surface)",
                  border:     "1px solid var(--color-outline-variant)",
                }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "var(--color-surface-container-high)",
                color:      "var(--color-on-surface)",
                border:     "1px solid var(--color-outline-variant)",
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name.trim() || !form.email.trim() || (showPassword && !form.password.trim())}
            className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            {loading ? "Saving..." : title}
          </button>
        </form>
      </div>
    </div>
  );
}