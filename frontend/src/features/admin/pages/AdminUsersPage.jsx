import { useEffect, useState } from "react";
import { listUsers } from "../api/adminApi";
import UserTable from "../components/UserTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  const fetchUsers = async (customParams = {}) => {
    try {
      setLoading(true);
      setError("");

      const res = await listUsers(customParams);
      const data = res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    await fetchUsers({
      q: search || undefined,
      status: status || undefined,
      role: role || undefined,
      page: 1,
      limit: 20,
    });
  };

  const onReset = async () => {
    setSearch("");
    setStatus("");
    setRole("");
    await fetchUsers();
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="text-slate-400 mt-2">
            Search and manage platform users by role and account status.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-400/30"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-400/30"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="pending_email_verification">Pending verification</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white outline-none focus:border-blue-400/30"
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="investor">Investor</option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold text-white transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 font-semibold text-slate-200 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <UserTable users={users} loading={loading} error={error} />
    </div>
  );
}