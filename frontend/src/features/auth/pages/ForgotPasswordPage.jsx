import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../lib/axios";

export default function ForgotPasswordPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/v1/auth/forgot-password", { email });
      setMsg(res?.data?.message || res?.data?.data?.message || "OTP sent (if email exists).");
      // move to reset page and carry email
      nav("/auth/reset-password", { state: { email } });
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Enter your email. We’ll send a reset OTP (if the email exists).
        </p>

        {err && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50"
              placeholder="you@example.com"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2.5 text-sm font-semibold"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div className="text-sm text-slate-400 flex items-center justify-between">
            <Link to="/auth/login" className="hover:text-white">Back to Login</Link>
            <Link to="/" className="hover:text-white">Home</Link>
          </div>
        </form>
      </div>
    </div>
  );
}