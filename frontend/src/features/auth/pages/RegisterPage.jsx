import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../lib/axios";
import AuthHeader from "../../../components/layout/AuthHeader";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

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
    <div className="relative min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 pt-20 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 z-0 pointer-events-none mask-image-gradient" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none z-0" />

      <AuthHeader className="relative z-20" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0B0D10]/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join the next generation of venture capital.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {okMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{okMsg}</span>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 8 characters"
                required
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="group w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-200 text-black font-bold py-3.5 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Account"}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="pt-4 text-center text-sm text-slate-400 border-t border-white/5 mt-6">
            Already have an account?{" "}
            <Link className="text-white font-semibold hover:text-cyan-400 transition-colors" to="/auth/login">
              Sign In
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}