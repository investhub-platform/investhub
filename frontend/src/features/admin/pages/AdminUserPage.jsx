import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteUser, getUserById, updateUser } from "../api/adminApi";

export default function AdminUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [rolesText, setRolesText] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUserById(id);
      const data = res?.data || null;

      setUser(data);
      setName(data?.name || "");
      setStatus(data?.status || "");
      setRolesText(Array.isArray(data?.roles) ? data.roles.join(", ") : "");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const roles = rolesText
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      await updateUser(id, {
        name,
        status,
        roles,
      });

      await fetchUser();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      await deleteUser(id);
      navigate("/admin/users", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-slate-300">
        Loading user...
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-white">User Details</h1>
        <p className="text-slate-400 mt-2">View and update selected user account.</p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-5 max-w-3xl">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-slate-400 outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white outline-none"
          >
            <option value="active">Active</option>
            <option value="pending_email_verification">Pending verification</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Roles (comma separated)
          </label>
          <input
            value={rolesText}
            onChange={(e) => setRolesText(e.target.value)}
            placeholder="user, admin"
            className="w-full rounded-2xl bg-[#0f172a] border border-white/10 px-4 py-3 text-white outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-3 font-semibold text-white transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={handleDelete}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 px-5 py-3 font-semibold text-red-300 transition"
          >
            Delete User
          </button>
        </div>
      </section>
    </div>
  );
}