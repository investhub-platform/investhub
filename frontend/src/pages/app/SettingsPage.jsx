import { useCallback, useEffect, useMemo, useState } from "react";
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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Linkedin,
  CreditCard,
  Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
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
  if (err?.response?.status === 401) return "Session expired or unauthorized. Please login again.";
  return err?.response?.data?.message || err?.message || fallback;
}

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-[#1A1D24] border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-inner";

const profileFieldMeta = [
  { key: "phone", label: "Phone", icon: Phone },
  { key: "location", label: "Location", icon: MapPin },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "NIC", label: "NIC", icon: CreditCard },
  { key: "Expertise", label: "Expertise", icon: Briefcase },
  { key: "profilePictureUrl", label: "Profile Image URL", icon: ImageIcon },
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
    profile: { phone: "", bio: "", location: "", profilePictureUrl: "", linkedin: "", NIC: "", Expertise: "" },
    preferences: { notificationEmail: true, notificationInApp: true },
  });

  const [passwordForm, setPasswordForm] = useState({ otp: "", newPassword: "" });

  const roleLabel = useMemo(() => {
    const first = form.roles?.[0] || "user";
    return String(first).toUpperCase();
  }, [form.roles]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/v1/users/me");
      const me = extractPayload(res?.data) || {};
      setForm({
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
      });
      setUser?.(me);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load settings"));
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onSaveSettings = async () => {
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const payload = { name: form.name, profile: form.profile, preferences: form.preferences };
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
    setSendingOtp(true); setError(""); setSuccess("");
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
    setResettingPwd(true); setError(""); setSuccess("");
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
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true); setError(""); setSuccess("");
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
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 lg:ml-64 relative z-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Manage your profile, preferences, and security settings.</p>
              </div>
              <button
                type="button"
                onClick={onSaveSettings}
                disabled={loading || saving}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] w-full sm:w-auto"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {success}
              </motion.div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                 <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                 <span className="font-medium">Loading settings...</span>
               </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 pb-20">
                
                {/* Main Profile Form */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-2 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Profile & Account</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                      <div className="relative">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input className={`${inputClass} pl-11`} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Email</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input className={`${inputClass} pl-11 opacity-60 cursor-not-allowed`} value={form.email} disabled />
                      </div>
                    </div>

                    {profileFieldMeta.map((field) => {
                       const Icon = field.icon;
                       return (
                         <div key={field.key}>
                           <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">{field.label}</label>
                           <div className="relative">
                             <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                             <input
                               className={`${inputClass} pl-11`}
                               value={form.profile[field.key] || ""}
                               onChange={(e) => setForm((p) => ({ ...p, profile: { ...p.profile, [field.key]: e.target.value } }))}
                               placeholder={`Enter ${field.label.toLowerCase()}`}
                             />
                           </div>
                         </div>
                       )
                    })}

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Bio</label>
                      <textarea
                        className={`${inputClass} min-h-[120px] resize-y py-4 leading-relaxed`}
                        value={form.profile.bio || ""}
                        onChange={(e) => setForm((p) => ({ ...p, profile: { ...p.profile, bio: e.target.value } }))}
                        placeholder="Tell others about your background..."
                      />
                    </div>
                  </div>
                </motion.section>

                {/* Sidebar Cards */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                  
                  {/* Notifications */}
                  <div className="rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Notifications</h3>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-white">Email Alerts</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">Receive updates via email</div>
                        </div>
                        <input type="checkbox" checked={!!form.preferences.notificationEmail} onChange={(e) => setForm((p) => ({ ...p, preferences: { ...p.preferences, notificationEmail: e.target.checked } }))} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                      </label>
                      <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-white">In-App Alerts</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">Show notifications inside app</div>
                        </div>
                        <input type="checkbox" checked={!!form.preferences.notificationInApp} onChange={(e) => setForm((p) => ({ ...p, preferences: { ...p.preferences, notificationInApp: e.target.checked } }))} className="w-5 h-5 accent-blue-500 cursor-pointer" />
                      </label>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Security</h3>
                    </div>

                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={onSendPasswordOtp}
                        disabled={sendingOtp || !form.email}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-50 shadow-inner"
                      >
                        {sendingOtp ? "Sending OTP..." : "Send Password Reset OTP"}
                      </button>

                      <input className={inputClass} placeholder="Enter OTP from email" value={passwordForm.otp} onChange={(e) => setPasswordForm((p) => ({ ...p, otp: e.target.value }))} />
                      <input type="password" className={inputClass} placeholder="Enter new password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />

                      <button
                        type="button"
                        onClick={onResetPassword}
                        disabled={resettingPwd || !passwordForm.otp || !passwordForm.newPassword}
                        className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                      >
                        {resettingPwd ? "Updating password..." : "Reset Password"}
                      </button>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Account Summary</div>
                    <div className="text-sm text-slate-300 flex justify-between items-center mb-3">
                      <span>Role</span>
                      <span className="font-bold text-white bg-white/10 px-2 py-1 rounded-md">{roleLabel}</span>
                    </div>
                    <div className="text-sm text-slate-300 flex justify-between items-center">
                      <span>Status</span>
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">{form.status || "UNKNOWN"}</span>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-3xl bg-red-500/5 border border-red-500/20 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
                    </div>
                    <p className="text-xs font-medium text-red-200/60 mb-5 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button
                      type="button"
                      onClick={onDeleteAccount}
                      disabled={deleting}
                      className="w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-bold text-white disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    >
                      {deleting ? "Deleting account..." : "Delete My Account"}
                    </button>
                  </div>

                </motion.section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}