import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../../../lib/axios";

export default function VerifyEmailPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const verify = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    setLoading(true);
    try {
      await api.post("/v1/auth/verify-email", { email, otp });
      setOkMsg("Email verified! You can login now.");
      nav("/auth/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Verify failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setOkMsg("");
    setResending(true);
    try {
      await api.post("/v1/auth/resend-email-otp", { email });
      setOkMsg("OTP resent. Check your email.");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Resend failed";
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter the OTP sent to your email (valid ~10 minutes).
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {okMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {okMsg}
          </div>
        )}

        <form onSubmit={verify} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">OTP</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2.5 font-semibold"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            disabled={resending}
            onClick={resend}
            className="w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2.5 font-semibold disabled:opacity-60"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>

          <div className="text-sm text-slate-300">
            Back to{" "}
            <Link className="text-blue-300 hover:text-blue-200" to="/auth/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}