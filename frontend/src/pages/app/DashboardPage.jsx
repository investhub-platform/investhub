import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import AppNavbar from "../../components/layout/AppNavBar";

export default function DashboardPage() {
  const { user } = useAuth();

  const mockStats = [
    { label: "Total Investments", value: "12" },
    { label: "Active Startups", value: "5" },
    { label: "Unread Notifications", value: "3" },
    { label: "Wallet Balance", value: "$2,450.00" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <AppNavbar />

      {/* because navbar is fixed */}
      <div className="pt-28 max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, {user?.name || "User"}.
            </p>
          </div>

          <Link
            to="/app/profile"
            className="hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            View Profile
          </Link>
        </div>

        {/* Mock Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="text-sm text-slate-400">{s.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Signed in as</div>
            <div className="mt-2 font-semibold">{user?.email}</div>
            <div className="mt-2 text-sm text-slate-300">
              Roles: {(user?.roles || []).join(", ") || "user"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-slate-400">Quick links</div>
            <div className="mt-3 flex flex-wrap gap-3">
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

              {/* later we will enable this when we build admin users page */}
              {/* <Link
                to="/app/admin/users"
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold"
              >
                Admin Users
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}