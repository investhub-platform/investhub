import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../lib/axios";

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // If user refreshes the page, location.state is lost.
  // Keep it simple: allow typing email again.
  useEffect(() => {
    setEmail((prev) => prev || "");
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/v1/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setMsg(res?.data?.message || res?.data?.data?.message || "Password reset successful.");
      // After success, go to login
      setTimeout(() => nav("/auth/login", { replace: true }), 700);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Enter the OTP from email and set a new password.
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

          <div>
            <label className="text-sm text-slate-300">OTP</label>
            <input
              inputMode="numeric"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50"
              placeholder="6-digit OTP"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50"
              placeholder="Min 8 characters"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2.5 text-sm font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-sm text-slate-400 flex items-center justify-between">
            <Link to="/auth/forgot-password" className="hover:text-white">Resend OTP</Link>
            <Link to="/auth/login" className="hover:text-white">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}