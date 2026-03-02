import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {user?.name || "User"}.</p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Signed in as</div>
            <div className="mt-2 font-semibold">{user?.email}</div>
            <div className="mt-2 text-sm text-slate-300">
              Roles: {(user?.roles || []).join(", ") || "user"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Quick links</div>
            <div className="mt-3 flex gap-3">
              <Link
                to="/app/profile"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold"
              >
                My Profile
              </Link>
              <Link
                to="/"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold"
              >
                Back to Landing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}