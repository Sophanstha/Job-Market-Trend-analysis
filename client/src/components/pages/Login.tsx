import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { clearAuthError, login } from '../../store/slices/AuthSlice';
import { FiLock, FiLogIn, FiMail } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {loading,token,error} = useAppSelector((a)=>a.auth)
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  useEffect(()=>{
    if(token) navigate("/")
  },[token,navigate])

const handleSubmit = async (e:React.FormEvent) => {
  e.preventDefault();

  if (!email.trim() || !password.trim()) return;

  try {
    await dispatch(
      login({ email: email.trim(), password })
    ).unwrap();
  } catch (err) {
    console.log("Login failed:", err);
  }
};
   return (
    <div className='min-h-screen flex justify-center items-center px-4'
     style={{ background: "var(--color-background)" }}
    >
      <div className='w-full max-w-md'>
        {/* header  */}
        <div className='text-center mb-8'>
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
            Welcome back
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Sign in to access your search history and saved analyses
          </p>
          
        </div>
        <div className='rounded-2xl p-8'
        style={{
            background: "var(--color-surface-container)",
            border:     "1px solid var(--color-outline-variant)",
        }}
        >
       <form
  onSubmit={handleSubmit}
  className="space-y-5"
  noValidate
>
  {/* Error */}
  {error && (
    <div
      className="rounded-xl p-4 text-sm font-medium"
      style={{
        background: "var(--color-error-container)",
        color:      "var(--color-on-error-container)",
      }}
    >
      {error}
    </div>
  )}

  {/* Email */}
  <div>
    <label
      className="block text-xs uppercase tracking-wider mb-2 font-bold label-precision"
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
        disabled={loading}
        className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all"
        style={{
          background: "var(--color-surface-container-high)",
          color:      "var(--color-on-surface)",
          border:     "1px solid var(--color-outline-variant)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(50,217,250,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-outline-variant)";
          e.currentTarget.style.boxShadow   = "none";
        }}
      />
    </div>
  </div>

  {/* Password */}
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
        placeholder="Enter your password"
        disabled={loading}
        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "var(--color-surface-container-high)",
          color:      "var(--color-on-surface)",
          border:     "1px solid var(--color-outline-variant)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(50,217,250,0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-outline-variant)";
          e.currentTarget.style.boxShadow   = "none";
        }}
      />
    </div>
  </div>

  {/* Submit */}
  <button
    type="submit"
    disabled={loading || !email.trim() || !password.trim()}
    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{
      background: "var(--color-primary)",
      color:      "var(--color-on-primary)",
    }}
  >
    {loading ? (
      <>
        <div
          className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{
            borderColor:    "rgba(0,0,0,0.2)",
            borderTopColor: "var(--color-on-primary)",
          }}
        />
        Signing in...
      </>
    ) : (
      <>
        <FiLogIn size={15} />
        Sign In
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
              Don't have an account?
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-outline-variant)" }}
            />
          </div>

          <Link
            to="/register"
            onClick={() => dispatch(clearAuthError())}
            className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "transparent",
              color:      "var(--color-primary)",
              border:     "1px solid var(--color-primary)",
            }}
          >
            Create an account
          </Link>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          You can use the app without signing in.{" "}
          <Link
            to="/"
            className="font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            Search without account →
          </Link>
        </p>

      </div>

        </div>

  )
}

export default Login