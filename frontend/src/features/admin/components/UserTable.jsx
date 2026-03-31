import { Link } from "react-router-dom";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20";
    case "suspended":
      return "bg-amber-500/10 text-amber-300 border border-amber-400/20";
    case "deleted":
      return "bg-red-500/10 text-red-300 border border-red-400/20";
    default:
      return "bg-blue-500/10 text-blue-300 border border-blue-400/20";
  }
}

export default function UserTable({ users = [], loading = false, error = "" }) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-slate-300">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-slate-400">
        No users found.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-white/5">
            <tr className="text-slate-300">
              <th className="text-left px-6 py-4 font-semibold">Name</th>
              <th className="text-left px-6 py-4 font-semibold">Email</th>
              <th className="text-left px-6 py-4 font-semibold">Roles</th>
              <th className="text-left px-6 py-4 font-semibold">Status</th>
              <th className="text-left px-6 py-4 font-semibold">Created</th>
              <th className="text-left px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t border-white/5 hover:bg-white/[0.03] transition"
              >
                <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                <td className="px-6 py-4 text-slate-300">{user.email}</td>
                <td className="px-6 py-4 text-slate-300">
                  {Array.isArray(user.roles) ? user.roles.join(", ") : "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      user.status
                    )}`}
                  >
                    {user.status || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{formatDate(user.createdUtc)}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/users/${user._id}`}
                    className="inline-flex rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-blue-300 hover:bg-blue-500/15 transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}