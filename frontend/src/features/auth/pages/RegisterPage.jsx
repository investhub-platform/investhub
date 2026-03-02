import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../lib/axios";

export default function RegisterPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOkMsg("");
    setLoading(true);

    try {
      await api.post("/v1/auth/register", { name, email, password });
      setOkMsg("OTP sent to your email. Please verify.");
      nav("/auth/verify-email", { state: { email } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Register failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Register and verify email to login.</p>

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

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

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
            <label className="text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 text-white outline-none focus:border-blue-500/50"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min 8 characters"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2.5 font-semibold"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="text-sm text-slate-300">
            Already have an account?{" "}
            <Link className="text-blue-300 hover:text-blue-200" to="/auth/login">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}