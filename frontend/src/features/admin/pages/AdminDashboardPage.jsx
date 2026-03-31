import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Shield,
  Building2,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
} from "lucide-react";
import AdminStatCard from "../components/AdminStatCard";
import { listUsers } from "../api/adminApi";
import { getAllStartups } from "../api/startupAdminApi";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

function getStatusBadgeClasses(status) {
  switch (status) {
    case "active":
    case "Approved":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20";
    case "suspended":
    case "NotApproved":
      return "bg-red-500/10 text-red-300 border border-red-400/20";
    case "pending":
    case "pending_email_verification":
      return "bg-amber-500/10 text-amber-300 border border-amber-400/20";
    default:
      return "bg-blue-500/10 text-blue-300 border border-blue-400/20";
  }
}

function MiniBarChart({ items = [] }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">{item.label}</span>
            <span className="text-white font-semibold text-sm">{item.value}</span>
          </div>

          <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutLegend({ items = [] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${item.dot}`} />
            <span className="text-slate-300 capitalize">{item.label}</span>
          </div>
          <span className="text-white font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [usersRes, startupsRes] = await Promise.all([
        listUsers({ page: 1, limit: 100 }),
        getAllStartups(),
      ]);

      const usersData = usersRes?.data || [];
      const startupsData = startupsRes?.data || [];

      setUsers(Array.isArray(usersData) ? usersData : []);
      setStartups(Array.isArray(startupsData) ? startupsData : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const suspendedUsers = users.filter((u) => u.status === "suspended").length;
    const pendingUsers = users.filter(
      (u) => u.status === "pending_email_verification"
    ).length;
    const adminUsers = users.filter(
      (u) => Array.isArray(u.roles) && u.roles.includes("admin")
    ).length;

    const pendingStartups = startups.filter((s) => s.status === "pending").length;
    const approvedStartups = startups.filter((s) => s.status === "Approved").length;
    const rejectedStartups = startups.filter((s) => s.status === "NotApproved").length;

    const roleCounts = users.reduce((acc, user) => {
      (user.roles || []).forEach((role) => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingUsers,
      adminUsers,
      pendingStartups,
      approvedStartups,
      rejectedStartups,
      roleCounts,
    };
  }, [users, startups]);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdUtc || 0) - new Date(a.createdUtc || 0))
      .slice(0, 6);
  }, [users]);

  const pendingStartupList = useMemo(() => {
    return startups.filter((s) => s.status === "pending").slice(0, 5);
  }, [startups]);

  const userStatusChartData = [
    {
      label: "Active Users",
      value: stats.activeUsers,
      gradient: "from-emerald-500 to-green-400",
    },
    {
      label: "Suspended Users",
      value: stats.suspendedUsers,
      gradient: "from-red-500 to-rose-400",
    },
    {
      label: "Pending Verification",
      value: stats.pendingUsers,
      gradient: "from-amber-500 to-yellow-400",
    },
    {
      label: "Admins",
      value: stats.adminUsers,
      gradient: "from-violet-500 to-fuchsia-400",
    },
  ];

  const startupStatusLegend = [
    {
      label: "Approved",
      value: stats.approvedStartups,
      dot: "bg-emerald-400",
    },
    {
      label: "Pending",
      value: stats.pendingStartups,
      dot: "bg-amber-400",
    },
    {
      label: "Rejected",
      value: stats.rejectedStartups,
      dot: "bg-red-400",
    },
  ];

  const startupTotal = Math.max(
    stats.approvedStartups + stats.pendingStartups + stats.rejectedStartups,
    1
  );

  const approvedPct = (stats.approvedStartups / startupTotal) * 100;
  const pendingPct = (stats.pendingStartups / startupTotal) * 100;
  const rejectedPct = (stats.rejectedStartups / startupTotal) * 100;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 mt-2">Loading dashboard data...</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 mt-2">Admin dashboard</p>
        </div>
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-7 shadow-[0_0_30px_rgba(15,23,42,0.35)]">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-0 w-56 h-56 bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 mb-4">
              Admin Control Center
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              InvestHub Platform Overview
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl">
              Monitor user growth, startup approval activity, and overall platform
              status from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/admin/users"
              className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition"
            >
              Manage Users
            </Link>

            <Link
              to="/admin/startups"
              className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/15 px-5 py-3 text-sm font-semibold text-cyan-200 transition"
            >
              Review Startups
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="All registered accounts"
          accent="blue"
          icon={<Users className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Active Users"
          value={stats.activeUsers}
          subtitle="Currently active accounts"
          accent="green"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Suspended Users"
          value={stats.suspendedUsers}
          subtitle="Restricted accounts"
          accent="red"
          icon={<UserX className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Admins"
          value={stats.adminUsers}
          subtitle="Users with admin access"
          accent="purple"
          icon={<Shield className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Pending Startups"
          value={stats.pendingStartups}
          subtitle="Awaiting review"
          accent="amber"
          icon={<Clock3 className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Approved Startups"
          value={stats.approvedStartups}
          subtitle="Platform-approved startups"
          accent="green"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">User Status Insights</h2>
              <p className="text-slate-400 text-sm mt-1">
                Simple chart view of current user distribution
              </p>
            </div>
          </div>

          <MiniBarChart items={userStatusChartData} />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <h2 className="text-xl font-semibold text-white">Startup Approval Mix</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Current approval state across submitted startups
          </p>

          <div className="flex items-center justify-center mb-6">
            <div
              className="relative w-40 h-40 rounded-full"
              style={{
                background: `conic-gradient(
                  rgb(52 211 153) 0% ${approvedPct}%,
                  rgb(251 191 36) ${approvedPct}% ${approvedPct + pendingPct}%,
                  rgb(248 113 113) ${approvedPct + pendingPct}% 100%
                )`,
              }}
            >
              <div className="absolute inset-4 rounded-full bg-[#0b1220] border border-white/10 flex flex-col items-center justify-center">
                <span className="text-slate-400 text-xs">Total</span>
                <span className="text-white text-2xl font-bold">{startupTotal}</span>
                <span className="text-slate-500 text-xs">Startups</span>
              </div>
            </div>
          </div>

          <DonutLegend items={startupStatusLegend} />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Users</h2>
              <p className="text-slate-400 text-sm mt-1">
                Latest accounts created on the platform
              </p>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="text-slate-400">No users available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="text-left py-3 pr-4">Name</th>
                    <th className="text-left py-3 pr-4">Email</th>
                    <th className="text-left py-3 pr-4">Roles</th>
                    <th className="text-left py-3 pr-4">Status</th>
                    <th className="text-left py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-white/5">
                      <td className="py-4 pr-4 text-white font-medium">{user.name}</td>
                      <td className="py-4 pr-4 text-slate-300">{user.email}</td>
                      <td className="py-4 pr-4 text-slate-300">
                        {(user.roles || []).join(", ") || "-"}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                            user.status
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{formatDate(user.createdUtc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <h2 className="text-xl font-semibold text-white mb-1">Role Distribution</h2>
          <p className="text-slate-400 text-sm mb-5">
            Current breakdown of user roles
          </p>

          <div className="space-y-4">
            {Object.keys(stats.roleCounts).length === 0 ? (
              <div className="text-slate-400">No role data available.</div>
            ) : (
              Object.entries(stats.roleCounts).map(([role, count]) => (
                <div key={role}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 capitalize">{role}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{
                        width: `${stats.totalUsers ? (count / stats.totalUsers) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-semibold text-white">Pending Startup Reviews</h2>
              <p className="text-slate-400 text-sm mt-1">
                Startups waiting for admin approval
              </p>
            </div>
            <Link
              to="/admin/startups"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Open queue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {pendingStartupList.length === 0 ? (
            <div className="text-slate-400">No pending startup approvals.</div>
          ) : (
            <div className="space-y-3">
              {pendingStartupList.map((startup) => (
                <div
                  key={startup._id}
                  className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 hover:bg-[#111b31] transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-cyan-300" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">{startup.name}</h3>
                          <p className="text-slate-400 text-xs mt-1">
                            Submitted for review
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm mt-3 line-clamp-2">
                        {startup.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                        startup.status
                      )}`}
                    >
                      {startup.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
          <h2 className="text-xl font-semibold text-white mb-1">Platform Snapshot</h2>
          <p className="text-slate-400 text-sm mb-5">
            High-level operational indicators
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-300" />
                <span className="text-slate-300">Rejected Startups</span>
              </div>
              <span className="text-red-300 font-semibold">{stats.rejectedStartups}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock3 className="w-5 h-5 text-amber-300" />
                <span className="text-slate-300">Approval Backlog</span>
              </div>
              <span className="text-amber-300 font-semibold">{stats.pendingStartups}</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-300" />
                <span className="text-slate-300">User Activation Rate</span>
              </div>
              <span className="text-emerald-300 font-semibold">
                {stats.totalUsers
                  ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`
                  : "0%"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-violet-300" />
                <span className="text-slate-300">Admin Coverage</span>
              </div>
              <span className="text-violet-300 font-semibold">
                {stats.totalUsers
                  ? `${Math.round((stats.adminUsers / stats.totalUsers) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}