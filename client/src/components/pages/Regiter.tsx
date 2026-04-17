import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthError, registerUser } from "../../store/slices/AuthSlice";
import { FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";

const Regiter = () => {
  const dispatch = useAppDispatch();
  const { loading, error, token } = useAppSelector((a) => a.auth);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localErr, setLocalErr] = useState<string | null>("");

  useEffect(() => {
    if (token) navigate("/");
  }, [token, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    console.log("hiii")
    e.preventDefault();
    setLocalErr(null);
    if (password !== confirm) {
      setLocalErr("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setLocalErr("Password must be at least 6 characters.");
      return;
    }
    await dispatch(
      registerUser({ email: email.trim(), name: name.trim(), password }),
    );
  };
  const inputStyle = {
    background: "var(--color-surface-container-high)",
    color: "var(--color-on-surface)",
    border: "1px solid var(--color-outline-variant)",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-primary)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(50,217,250,0.1)";
  };

  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--color-outline-variant)";
    e.currentTarget.style.boxShadow = "none";
  };

  const displayError = localErr || error;

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4 py-12"
      style={{
        background: "var(--color-background)",
      }}
    >
      <div className="max-w-md w-full">
        <Link
          to="/"
          className="headline text-2xl font-bold inline-block mb-6"
          style={{ color: "var(--color-on-surface)" }}
        >
          Trend<span style={{ color: "var(--color-primary)" }}>Architect</span>
        </Link>
        <h1
          className="headline text-3xl font-extrabold tracking-tight mb-2"
          style={{ color: "var(--color-on-surface)" }}
        >
          Create account
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Save your searches and track your career research over time
        </p>
      </div>
      <div
        className="rounded-2xl p-8"
        style={{
          background: "var(--color-surface-container)",
          border: "1px solid var(--color-outline-variant)",
        }}
      >
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Error */}
          {displayError && (
            <div
              className="rounded-xl p-4 text-sm font-medium"
              style={{
                background: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
              }}
            >
              {displayError}
            </div>
          )}
          {/* name */}
          <div>
            <label
              className="block text-xs label-precision font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Full Name
            </label>
            <div className="relative">
              <FiUser
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-on-surface-variant)" }}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label
              className="block text-xs label-precision font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Email Address
            </label>
            <div className="relative">
              <FiMail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-on-surface-variant)" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
          {/* password */}
          <div>
            <label
              className="block text-xs label-precision font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Password
            </label>
            <div className="relative">
              <FiLock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-on-surface-variant)" }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12******"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
          {/* Confirm password */}
          <div>
            <label
              className="block text-xs label-precision font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <FiLock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-on-surface-variant)" }}
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="12****"
                required
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs mt-1" style={{ color: "var(--color-error)" }}>
              Passwords do not match
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !name.trim() ||
              !email.trim() ||
              !password ||
              password !== confirm
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-on-primary)",
            }}
          >
            {loading ? (
              <>
                <div
                  className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{
                    borderColor: "rgba(0,0,0,0.2)",
                    borderTopColor: "var(--color-on-primary)",
                  }}
                />
                Creating account...
              </>
            ) : (
              <>
                <FiUserPlus size={15} />
                Create Account
              </>
            )}
          </button>
        </form>

                  {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-outline-variant)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Already have an account?
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-outline-variant)" }}
            />
          </div>

          <Link
            to="/login"
            onClick={() => dispatch(clearAuthError())}
            className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "transparent",
              color:      "var(--color-primary)",
              border:     "1px solid var(--color-primary)",
            }}
          >
            Sign in instead
          </Link>
    {/* Footer note */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          No account needed to search.{" "}
          <Link
            to="/"
            className="font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            Go to home →
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Regiter;
