// ProfilePage.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/useAuth";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import { Camera, Loader } from "lucide-react";

function extractPayload(responseData) {
  if (!responseData) return null;
  if (responseData.data && typeof responseData.data === "object") return responseData.data;
  return responseData;
}

function getApiErrorMessage(err, fallback) {
  if (err?.response?.status === 401) return "Session expired or unauthorized. Please login again.";
  return err?.response?.data?.message || err?.message || fallback;
}

export default function ProfilePage() {
  const { fetchMe, user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    profile: {
      phone: "",
      bio: "",
      location: "",
      linkedin: "",
      NIC: "",
      Expertise: "",
      profilePictureUrl: "",
    },
    preferences: {
      notificationEmail: true,
      notificationInApp: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
          profilePictureUrl: me?.profile?.profilePictureUrl || "",
        },
        preferences: {
          notificationEmail: me?.preferences?.notificationEmail ?? true,
          notificationInApp: me?.preferences?.notificationInApp ?? true,
        },
      });
    } catch (e) {
      setErr(getApiErrorMessage(e, "Failed to load profile"));
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
      setErr(getApiErrorMessage(e, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  const onAvatarFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErr("Only JPEG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErr("Avatar must be 2MB or less.");
      return;
    }

    setUploadingAvatar(true);
    setErr("");
    setMsg("");

    try {
      const body = new FormData();
      body.append("avatar", file);

      const res = await api.post("/v1/users/me/avatar", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = extractPayload(res?.data) || {};
      const avatarUrl = data?.avatarUrl || data?.user?.profile?.profilePictureUrl || "";
      const updatedUser = data?.user || null;

      if (updatedUser) setUser(updatedUser);

      if (avatarUrl) {
        setForm((p) => ({
          ...p,
          profile: {
            ...p.profile,
            profilePictureUrl: avatarUrl,
          },
        }));
      }

      setMsg("Profile picture uploaded successfully.");
    } catch (e) {
      setErr(getApiErrorMessage(e, "Failed to upload profile picture"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const avatarSrc = form.profile.profilePictureUrl || user?.profile?.profilePictureUrl || "";
  const initials =
    (form.name || user?.name || "User")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader className="w-5 h-5 animate-spin" /> Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 lg:ml-64 relative z-10 scroll-smooth">
          <div className="max-w-5xl mx-auto w-full">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Profile</h1>
            <p className="text-slate-400 mt-1">Update your profile details and notification preferences.</p>

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
              <div className="rounded-2xl bg-[#0B0D10]/80 border border-white/10 p-6">
                <div className="text-sm text-slate-400">Profile Photo</div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 grid place-items-center">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-slate-300">{initials}</span>
                    )}
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={onAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={openAvatarPicker}
                      disabled={uploadingAvatar}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {uploadingAvatar ? <Loader className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      {uploadingAvatar ? "Uploading..." : "Upload photo"}
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPEG, PNG, or WEBP. Max size 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0B0D10]/80 border border-white/10 p-6">
                <div className="text-sm text-slate-400">Account</div>

                <label className="block mt-4 text-sm text-slate-400">Name</label>
                <input
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50 text-sm transition-colors"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />

                <label className="block mt-4 text-sm text-slate-400">Email (readonly)</label>
                <input
                  className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 opacity-70 text-sm"
                  value={user?.email || ""}
                  readOnly
                />
              </div>

              <div className="rounded-2xl bg-[#0B0D10]/80 border border-white/10 p-6">
                <div className="text-sm text-slate-400">Preferences</div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm">Email notifications</div>
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
                    className="h-5 w-5 accent-blue-500 bg-white/5 border-white/10 rounded"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-sm">In-app notifications</div>
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
                    className="h-5 w-5 accent-blue-500 bg-white/5 border-white/10 rounded"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#0B0D10]/80 border border-white/10 p-6 lg:col-span-2">
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
                      <label className="text-sm text-slate-400">{label}</label>
                      <input
                        className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50 text-sm transition-colors"
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
                    <label className="text-sm text-slate-400">Bio</label>
                    <textarea
                      className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-blue-500/50 text-sm min-h-[110px] resize-none transition-colors"
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
                    disabled={saving || uploadingAvatar}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    onClick={load}
                    disabled={saving || uploadingAvatar}
                    className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    Reload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}