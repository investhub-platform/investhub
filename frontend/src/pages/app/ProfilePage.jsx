import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/AuthContext";
import AppNavbar from "../../components/layout/AppNavbar";


export default function ProfilePage() {
  const { fetchMe, user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    profile: {
      phone: "",
      bio: "",
      location: "",
      linkedin: "",
      NIC: "",
      Expertise: "",
    },
    preferences: {
      notificationEmail: true,
      notificationInApp: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const me = await fetchMe();
      setUser(me);

      setForm({
        name: me?.name || "",
        profile: {
          phone: me?.profile?.phone || "",
          bio: me?.profile?.bio || "",
          location: me?.profile?.location || "",
          linkedin: me?.profile?.linkedin || "",
          NIC: me?.profile?.NIC || "",
          Expertise: me?.profile?.Expertise || "",
        },
        preferences: {
          notificationEmail: me?.preferences?.notificationEmail ?? true,
          notificationInApp: me?.preferences?.notificationInApp ?? true,
        },
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      await api.patch("/v1/users/me", form);
      await load();
      setMsg("Profile updated successfully.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <AppNavbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-10">
         <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-slate-400 mt-1">Update your profile & preferences.</p>

        {err && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {msg && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {msg}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Account</div>

            <label className="block mt-4 text-sm text-slate-300">Name</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <label className="block mt-4 text-sm text-slate-300">Email (readonly)</label>
            <input
              className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 opacity-70"
              value={user?.email || ""}
              readOnly
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-slate-400">Preferences</div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">Email notifications</div>
                <div className="text-sm text-slate-400">Receive updates via email</div>
              </div>
              <input
                type="checkbox"
                checked={form.preferences.notificationEmail}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    preferences: { ...p.preferences, notificationEmail: e.target.checked },
                  }))
                }
                className="h-5 w-5"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">In-app notifications</div>
                <div className="text-sm text-slate-400">Show notifications inside app</div>
              </div>
              <input
                type="checkbox"
                checked={form.preferences.notificationInApp}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    preferences: { ...p.preferences, notificationInApp: e.target.checked },
                  }))
                }
                className="h-5 w-5"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <div className="text-sm text-slate-400">Profile details</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["phone", "Phone"],
                ["location", "Location"],
                ["linkedin", "LinkedIn"],
                ["NIC", "NIC"],
                ["Expertise", "Expertise"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm text-slate-300">{label}</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50"
                    value={form.profile[key] || ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        profile: { ...p.profile, [key]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Bio</label>
                <textarea
                  className="mt-1 w-full rounded-xl bg-[#0B0D10] border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50 min-h-[110px]"
                  value={form.profile.bio || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      profile: { ...p.profile, bio: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                onClick={load}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}