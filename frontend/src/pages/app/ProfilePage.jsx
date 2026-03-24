// ProfilePage.jsx
import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/useAuth";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";

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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex"> {/* Updated layout */}
      <DesktopSidebar /> {/* Added sidebar */}

      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
          <h1 className="text-3xl heading-tight">My Profile</h1> {/* Updated typography */}
          <p className="text-muted-foreground mt-1">Update your profile & preferences.</p>

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
            <div className="obsidian-card p-6"> {/* Updated design */}
              <div className="text-sm text-muted-foreground">Account</div>

              <label className="block mt-4 text-sm text-muted-foreground">Name</label>
              <input
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-primary/50 text-sm transition-colors"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />

              <label className="block mt-4 text-sm text-muted-foreground">Email (readonly)</label>
              <input
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 opacity-70 text-sm"
                value={user?.email || ""}
                readOnly
              />
            </div>

            <div className="obsidian-card p-6"> {/* Updated design */}
              <div className="text-sm text-muted-foreground">Preferences</div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm">Email notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates via email</div>
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
                  className="h-5 w-5 accent-primary bg-white/5 border-white/10 rounded"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm">In-app notifications</div>
                  <div className="text-sm text-muted-foreground">Show notifications inside app</div>
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
                  className="h-5 w-5 accent-primary bg-white/5 border-white/10 rounded"
                />
              </div>
            </div>

            <div className="obsidian-card p-6 lg:col-span-2"> {/* Updated design */}
              <div className="text-sm text-muted-foreground">Profile details</div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ["phone", "Phone"],
                  ["location", "Location"],
                  ["linkedin", "LinkedIn"],
                  ["NIC", "NIC"],
                  ["Expertise", "Expertise"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-sm text-muted-foreground">{label}</label>
                    <input
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-primary/50 text-sm transition-colors"
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
                  <label className="text-sm text-muted-foreground">Bio</label>
                  <textarea
                    className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-primary/50 text-sm min-h-[110px] resize-none transition-colors"
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
                  className="rounded-xl gradient-blue px-5 py-2.5 text-sm font-semibold text-white glow-blue transition-all disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  onClick={load}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  Reload
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}