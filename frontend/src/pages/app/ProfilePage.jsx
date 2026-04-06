import { useEffect, useRef, useState } from "react";
import api from "../../lib/axios";
import { useAuth } from "../../features/auth/useAuth";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import { motion } from "framer-motion";
import { 
  Camera, 
  Loader, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Linkedin, 
  CreditCard, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Bell,
  Crown
} from "lucide-react";

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
  const isProUser = Boolean(user?.subscription?.isAnyPro);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Fixed Top Navbar */}
      <AppNavbar />

      {/* Main App Shell */}
      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Sticky Sidebar */}
        <DesktopSidebar />

        {/* Scrollable Content Area */}
        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 lg:ml-64 relative z-10 scroll-smooth">
          <div className="max-w-5xl mx-auto w-full">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">My Profile</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Manage your public identity and contact preferences.</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={load}
                  disabled={saving || uploadingAvatar}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" /> Reload
                </button>
                <button
                  onClick={onSave}
                  disabled={saving || uploadingAvatar}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {err && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /> {err}
              </motion.div>
            )}
            {msg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {msg}
              </motion.div>
            )}

            {loading ? (
               <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                 <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                 <span className="font-medium">Loading profile...</span>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-20">
                
                {/* Left Column: Account & Preferences */}
                <div className="space-y-6 md:space-y-8">
                  
                  {/* Account Card (Now includes Avatar Upload) */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 md:p-8 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                    
                    {/* Profile Photo Section */}
                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/5 relative z-10">
                      <div 
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#1A1D24] border-2 border-white/10 shrink-0 group cursor-pointer"
                        onClick={openAvatarPicker}
                      >
                        {avatarSrc ? (
                          <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-slate-300 flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                            {initials}
                          </span>
                        )}

                        {isProUser ? (
                          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border border-amber-100 text-slate-900 flex items-center justify-center shadow-lg z-20">
                            <Crown className="w-4 h-4" />
                          </div>
                        ) : null}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <Camera className="w-6 h-6 text-white" />
                        </div>
                        
                        {uploadingAvatar && (
                           <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                           </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white mb-1">Profile Photo</h3>
                        <p className="text-xs text-slate-400 mb-3 hidden sm:block">JPEG, PNG, or WEBP. Max size 2MB.</p>
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarFileChange} className="hidden" />
                        <button
                          type="button"
                          onClick={openAvatarPicker}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-colors flex items-center gap-2 text-slate-300 hover:text-white disabled:opacity-50"
                        >
                          {uploadingAvatar ? <Loader className="w-3.5 h-3.5 animate-spin"/> : <Camera className="w-3.5 h-3.5" />}
                          {uploadingAvatar ? "Uploading..." : "Change Photo"}
                        </button>
                      </div>
                    </div>

                    {/* Account Info Form */}
                    <div className="space-y-5 relative z-10">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input className={`${inputClass} pl-11`} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input className={`${inputClass} pl-11 opacity-60 cursor-not-allowed`} value={user?.email || ""} readOnly />
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 mt-2 ml-1">Email cannot be changed.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Preferences Card */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 md:p-8 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h2 className="text-lg font-bold text-white">Preferences</h2>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-white">Email Notifications</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">Receive updates via email</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.preferences.notificationEmail}
                          onChange={(e) => setForm((p) => ({ ...p, preferences: { ...p.preferences, notificationEmail: e.target.checked } }))}
                          className="w-5 h-5 accent-blue-500 cursor-pointer"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                        <div>
                          <div className="font-bold text-sm text-white">In-App Notifications</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">Show alerts inside the app</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={form.preferences.notificationInApp}
                          onChange={(e) => setForm((p) => ({ ...p, preferences: { ...p.preferences, notificationInApp: e.target.checked } }))}
                          className="w-5 h-5 accent-blue-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Profile Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden h-fit">
                   <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
                   
                   <div className="flex items-center gap-3 mb-8 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Public Details</h2>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                     {[
                       { key: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 000-0000" },
                       { key: "location", label: "Location", icon: MapPin, placeholder: "City, Country" },
                       { key: "linkedin", label: "LinkedIn URL", icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                       { key: "NIC", label: "National ID (NIC)", icon: CreditCard, placeholder: "ID Number" },
                     ].map((field) => (
                       <div key={field.key}>
                         <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">{field.label}</label>
                         <div className="relative">
                           <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                           <input
                             className={`${inputClass} pl-11`}
                             value={form.profile[field.key] || ""}
                             onChange={(e) => setForm((p) => ({ ...p, profile: { ...p.profile, [field.key]: e.target.value } }))}
                             placeholder={field.placeholder}
                           />
                         </div>
                       </div>
                     ))}

                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Expertise / Industry</label>
                       <div className="relative">
                         <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input
                           className={`${inputClass} pl-11`}
                           value={form.profile.Expertise || ""}
                           onChange={(e) => setForm((p) => ({ ...p, profile: { ...p.profile, Expertise: e.target.value } }))}
                           placeholder="e.g. Full Stack Development, SaaS, FinTech"
                         />
                       </div>
                     </div>

                     <div className="md:col-span-2">
                       <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Bio</label>
                       <textarea
                         className={`${inputClass} min-h-[140px] resize-y py-4 leading-relaxed`}
                         value={form.profile.bio || ""}
                         onChange={(e) => setForm((p) => ({ ...p, profile: { ...p.profile, bio: e.target.value } }))}
                         placeholder="Tell founders and investors about your background, experience, and goals..."
                       />
                     </div>
                   </div>
                </motion.div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}