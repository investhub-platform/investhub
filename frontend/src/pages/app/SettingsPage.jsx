import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Loader,
  Lock,
  Save,
  ShieldAlert,
  User,
} from "lucide-react";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/useAuth";

function extractPayload(responseData) {
  if (!responseData) return null;
  if (responseData.data && typeof responseData.data === "object") return responseData.data;
  return responseData;
}

function getApiErrorMessage(err, fallback) {
  if (err?.response?.status === 401) {
    return "Session expired or unauthorized. Please login again.";
  }
  return err?.response?.data?.message || err?.message || fallback;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500";

const profileFieldMeta = [
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "NIC", label: "NIC" },
  { key: "Expertise", label: "Expertise" },
  { key: "profilePictureUrl", label: "Profile Image URL" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPwd, setResettingPwd] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    roles: [],
    status: "",
    profile: {
      phone: "",
      bio: "",
      location: "",
      profilePictureUrl: "",
      linkedin: "",
      NIC: "",
      Expertise: "",
    },
    preferences: {
      notificationEmail: true,
      notificationInApp: true,
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    otp: "",
    newPassword: "",
  });

  const roleLabel = useMemo(() => {
    const first = form.roles?.[0] || "user";
    return String(first).toUpperCase();
  }, [form.roles]);

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/v1/users/me");
      const me = extractPayload(res?.data) || {};
      const nextForm = {
        name: me?.name || "",
        email: me?.email || "",
        roles: Array.isArray(me?.roles) ? me.roles : [],
        status: me?.status || "",
        profile: {
          phone: me?.profile?.phone || "",
          bio: me?.profile?.bio || "",
          location: me?.profile?.location || "",
          profilePictureUrl: me?.profile?.profilePictureUrl || "",
          linkedin: me?.profile?.linkedin || "",
          NIC: me?.profile?.NIC || "",
          Expertise: me?.profile?.Expertise || "",
        },
        preferences: {
          notificationEmail: me?.preferences?.notificationEmail ?? true,
          notificationInApp: me?.preferences?.notificationInApp ?? true,
        },
      };
      setForm(nextForm);
      setUser?.(me);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSaveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        profile: form.profile,
        preferences: form.preferences,
      };
      const res = await api.patch("/v1/users/me", payload);
      const updated = extractPayload(res?.data);
      if (updated) setUser?.(updated);
      setSuccess("Settings updated successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update settings"));
    } finally {
      setSaving(false);
    }
  };

  const onSendPasswordOtp = async () => {
    setSendingOtp(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/v1/auth/forgot-password", { email: form.email || user?.email });
      setSuccess("Password reset OTP sent to your email.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send OTP"));
    } finally {
      setSendingOtp(false);
    }
  };

  const onResetPassword = async () => {
    setResettingPwd(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/v1/auth/reset-password", {
        email: form.email || user?.email,
        otp: passwordForm.otp,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ otp: "", newPassword: "" });
      setSuccess("Password reset successfully. Please login again.");
      await logout();
      navigate("/auth/login", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to reset password"));
    } finally {
      setResettingPwd(false);
    }
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      await api.delete("/v1/users/me");
      await logout();
      navigate("/auth/login", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete account"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 lg:ml-64 relative z-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 md:mb-10 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Manage your profile, preferences, and security settings.</p>
              </div>
              <button
                type="button"
                onClick={onSaveSettings}
                disabled={loading || saving}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
              </motion.div>
            )}

            {loading ? (
              <div className="h-[50vh] grid place-items-center text-slate-400">
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <Loader className="w-5 h-5 animate-spin" /> Loading settings...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 pb-10">
                <section className="xl:col-span-2 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 md:p-8 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Profile & Account</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Full Name</label>
                      <input
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Email</label>
                      <input className={`${inputClass} opacity-70 cursor-not-allowed`} value={form.email} disabled />
                    </div>

                    {profileFieldMeta.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">{field.label}</label>
                        <input
                          className={inputClass}
                          value={form.profile[field.key] || ""}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              profile: {
                                ...p.profile,
                                [field.key]: e.target.value,
                              },
                            }))
                          }
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Bio</label>
                      <textarea
                        className={`${inputClass} min-h-28 resize-y`}
                        value={form.profile.bio || ""}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            profile: {
                              ...p.profile,
                              bio: e.target.value,
                            },
                          }))
                        }
                        placeholder="Tell others about your background"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-5">
                      <Bell className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-bold text-white">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-200">Email Alerts</span>
                        <input
                          type="checkbox"
                          checked={!!form.preferences.notificationEmail}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              preferences: {
                                ...p.preferences,
                                notificationEmail: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 accent-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-200">In-App Alerts</span>
                        <input
                          type="checkbox"
                          checked={!!form.preferences.notificationInApp}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              preferences: {
                                ...p.preferences,
                                notificationInApp: e.target.checked,
                              },
                            }))
                          }
                          className="w-4 h-4 accent-blue-500"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-5">
                      <Lock className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>

                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={onSendPasswordOtp}
                        disabled={sendingOtp || !form.email}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50"
                      >
                        {sendingOtp ? "Sending OTP..." : "Send Password Reset OTP"}
                      </button>

                      <input
                        className={inputClass}
                        placeholder="Enter OTP"
                        value={passwordForm.otp}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, otp: e.target.value }))}
                      />

                      <input
                        type="password"
                        className={inputClass}
                        placeholder="New password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                      />

                      <button
                        type="button"
                        onClick={onResetPassword}
                        disabled={resettingPwd || !passwordForm.otp || !passwordForm.newPassword}
                        className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {resettingPwd ? "Updating password..." : "Reset Password"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-5 h-5 text-red-300" />
                      <h3 className="text-lg font-bold text-red-200">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-red-100/80 mb-4">Delete your account permanently. This cannot be undone.</p>
                    <button
                      type="button"
                      onClick={onDeleteAccount}
                      disabled={deleting}
                      className="w-full px-4 py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {deleting ? "Deleting account..." : "Delete My Account"}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Account Summary</div>
                    <div className="text-sm text-slate-200 flex justify-between">
                      <span>Role</span>
                      <span className="font-bold">{roleLabel}</span>
                    </div>
                    <div className="text-sm text-slate-200 flex justify-between mt-1">
                      <span>Status</span>
                      <span className="font-bold">{form.status || "UNKNOWN"}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
