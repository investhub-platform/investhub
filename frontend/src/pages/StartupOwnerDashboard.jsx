import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useAuth } from "@/features/auth/useAuth";
import api from "@/lib/axios";
// Use a local formatter instead of mock data
const formatCurrency = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};
import {
  Plus,
  X,
  Upload,
  FileText,
  ImageUp,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BriefcaseBusiness,
  Loader,
  LayoutDashboard
} from "lucide-react";

const resolveAssetUrl = (url) => {
  if (!url) return "";
  const raw = String(url);
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const baseFromApi = String(api.defaults?.baseURL || "");
  const base = (baseFromApi.startsWith("http")
    ? baseFromApi.replace(/\/api\/?$/, "")
    : "http://localhost:5000").replace(/\/+$/, "");
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
};

const formatFileSize = (size = 0) => {
  const value = Number(size || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const inputClass = "w-full px-4 py-3.5 rounded-xl bg-[#1A1D24] border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-inner";

const StartupOwnerDashboard = () => {
  const { user } = useAuth();
  const [dashboardTab, setDashboardTab] = useState("startups");
  const [activeView, setActiveView] = useState("manage");
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [planFormData, setPlanFormData] = useState({
    title: "",
    description: "",
    category: "Tech",
    customCategory: "",
    budget: "",
    timeline: "",
    expectedOutcomes: "",
    pitchDeckText: ""
  });
  const [planPhotoFile, setPlanPhotoFile] = useState(null);
  const [planPitchFiles, setPlanPitchFiles] = useState([]);
  const [planSaving, setPlanSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const normalizeRequest = (request) => {
    const investorName = request.investorId?.name || request.createdBy?.name || "Unknown Investor";
    const investorAvatar = investorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    return {
      id: request._id || request.id,
      status: (request.requestStatus || "pending").toLowerCase(),
      direction: request.direction || "investor_to_startup",
      amount: request.amount || 0,
      message: request.message || "",
      date: request.createdUtc || request.createdAt
          ? new Date(request.createdUtc || request.createdAt).toLocaleDateString()
          : "",
      investorName,
      investorAvatar,
      createdBy: request.createdBy,
      investorId: request.investorId,
      raw: request
    };
  };

  const normalizeStartup = (startup) => ({
    id: startup._id || startup.id,
    name: startup.name || "Untitled Startup",
    tagline: startup.description || "No tagline available",
    description: startup.description || "",
    BR: startup.BR || "",
    status: String(startup.status || "pending").toLowerCase(),
    stage: startup.stage || "Pre-Seed",
    // Prefer multiple possible fields returned by the API for real numbers
    fundingGoal: Number(startup.budget || startup.fundingGoal || startup.goal || 0),
    currentFunding: Number(startup.currentFunding || startup.raised || startup.capitalRaised || 0),
    investorRequests: startup.investorRequests || [],
    logoUrl: resolveAssetUrl(startup.ImgURL || startup.logo || startup.logoUrl || ""),
    logoInitials: (startup.name ? startup.name.slice(0, 2).toUpperCase() : "SU") || "SU",
    raw: startup
  });

  const fetchStartups = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(""); setActionMessage("");

    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        setError("User ID is missing. Please re-login.");
        return;
      }
      const res = await api.get(`/v1/startups/user/${userId}`);
      const data = res?.data?.data || [];

      const enriched = await Promise.all(
        data.map(async (startup) => {
          const startupId = startup._id || startup.id;
          let investorRequests = startup.investorRequests || [];
          try {
            const reqRes = await api.get(`/v1/requests/startup/${startupId}`);
            investorRequests = (reqRes?.data?.data || []).map(normalizeRequest);
          } catch { /* ignore */ }
          return normalizeStartup({ ...startup, investorRequests });
        })
      );
      setStartups(enriched);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load startups.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadPlans = useCallback(async () => {
    if (!user) return;
    setPlansLoading(true); setPlansError("");

    try {
      const res = await api.get("/v1/ideas/plans");
      const userId = user?.id || user?._id;
      const allPlans = res?.data?.data || [];
      const myPlans = allPlans.filter((p) => String(p.createdBy) === String(userId));
      setPlans(myPlans);
    } catch (e) {
      setPlansError(e?.response?.data?.message || "Failed to load investment plans.");
    } finally {
      setPlansLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchStartups(); }, [fetchStartups, user]);
  useEffect(() => { if (dashboardTab === "plans") loadPlans(); }, [dashboardTab, loadPlans, user]);

  const handleStartupCreated = (startup) => {
    setStartups((prev) => [normalizeStartup(startup), ...prev]);
    setActionMessage("Startup successfully created.");
    setActiveView("manage");
  };

  const handleUpdateStartup = async (startupId, payload) => {
    try {
      setLoading(true); setError("");
      let res;
      // Support FormData payloads for file uploads (logo) or plain JSON
      if (typeof FormData !== "undefined" && payload instanceof FormData) {
        res = await api.put(`/v1/startups/${startupId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        res = await api.put(`/v1/startups/${startupId}`, payload);
      }
      const updated = normalizeStartup(res?.data?.data);
      setStartups((prev) => prev.map((s) => (s.id === startupId ? updated : s)));
      setActionMessage("Startup updated successfully.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update startup.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStartup = async (startupId) => {
    try {
      setLoading(true); setError("");
      await api.delete(`/v1/startups/${startupId}`);
      setStartups((prev) => prev.filter((s) => s.id !== startupId));
      setActionMessage("Startup deleted successfully.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete startup.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStatus = async (startupId, request, status) => {
    try {
      setLoading(true); setError("");
      const requestId = request?.id || request?._id;
      const updatedBy = user?.id || user?._id;

      if (status === "withdrawn") {
        await api.patch(`/v1/requests/${requestId}/withdraw`, { updatedBy });
      } else if (
        request?.direction === "investor_to_startup" &&
        (request?.status === "pending_founder" || request?.status === "pending") &&
        (status === "approved" || status === "rejected")
      ) {
        await api.patch(`/v1/requests/${requestId}/founder-decision`, {
          decision: status === "approved" ? "accept" : "reject",
          comment: status === "approved" ? "Approved by founder" : "Rejected by founder",
          updatedBy
        });
      } else {
        await api.patch(`/v1/requests/${requestId}/status`, { requestStatus: status, updatedBy });
      }

      const reqRes = await api.get(`/v1/requests/startup/${startupId}`);
      const investorRequests = (reqRes?.data?.data || []).map(normalizeRequest);
      setStartups((prev) => prev.map((s) => (s.id === startupId ? { ...s, investorRequests } : s)));
      setActionMessage(`Request ${status} successfully.`);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update request status.");
    } finally {
      setLoading(false);
    }
  };

  const clearPlanForm = () => {
    setPlanFormData({ title: "", description: "", category: "Tech", customCategory: "", budget: "", timeline: "", expectedOutcomes: "", pitchDeckText: "" });
    setPlanPhotoFile(null); setPlanPitchFiles([]); setEditingPlanId(null);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!planFormData.title.trim() || !planFormData.description.trim()) return setPlansError("Title and description are required.");
    setPlanSaving(true); setPlansError("");

    try {
      const form = new FormData();
      form.append("title", planFormData.title);
      form.append("description", planFormData.description);
      form.append("category", planFormData.category);
      if (planFormData.category === "Other") form.append("customCategory", planFormData.customCategory || "");
      form.append("budget", String(planFormData.budget || 0));
      form.append("timeline", planFormData.timeline || "");
      form.append("expectedOutcomes", planFormData.expectedOutcomes || "");
      form.append("pitchDeckText", planFormData.pitchDeckText || "");
      form.append("isIdea", "false");
      if (planPhotoFile) form.append("photo", planPhotoFile);
      Array.from(planPitchFiles || []).forEach((file) => form.append("pitchDeckFiles", file));

      if (editingPlanId) {
        await api.put(`/v1/ideas/${editingPlanId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        setActionMessage("Investment plan updated successfully.");
      } else {
        await api.post("/v1/ideas", form, { headers: { "Content-Type": "multipart/form-data" } });
        setActionMessage("Investment plan created successfully.");
      }

      clearPlanForm(); setIsPlanFormOpen(false); loadPlans();
    } catch (e) {
      setPlansError(e?.response?.data?.message || "Failed to save investment plan.");
    } finally {
      setPlanSaving(false);
    }
  };

  const handlePlanEdit = (plan) => {
    setEditingPlanId(plan._id || plan.id);
    setPlanFormData({
      title: plan.title || "", description: plan.description || "", category: plan.category || "Tech",
      customCategory: plan.customCategory || "",
      budget: plan.budget || "", timeline: plan.timeline || "", expectedOutcomes: plan.expectedOutcomes || "",
      pitchDeckText: plan.pitchDeckText || ""
    });
    setPlanPhotoFile(null); setPlanPitchFiles([]); setIsPlanFormOpen(true);
  };

  const handlePlanDelete = async (planId) => {
    if (!window.confirm("Delete this investment plan?")) return;
    try {
      await api.delete(`/v1/ideas/${planId}`);
      setActionMessage("Investment plan deleted successfully.");
      loadPlans();
    } catch (e) {
      setPlansError(e?.response?.data?.message || "Failed to delete investment plan.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 scroll-smooth md:ml-64 lg:ml-64">
          <div className="max-w-6xl mx-auto">
            
            {/* Header Area */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Founder Hub</h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">Manage your startups, pitch ideas, and handle investor relations.</p>
            </div>

            {/* Segmented Control Tabs */}
            <div className="inline-flex rounded-full p-1.5 bg-[#0B0D10]/80 border border-white/10 backdrop-blur-xl mb-8 shadow-lg overflow-x-auto max-w-full">
              {[
                { key: "startups", label: "Startups & Ideas" },
                { key: "plans", label: "Investor Plans" },
              ].map((tab) => {
                const isActive = dashboardTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDashboardTab(tab.key)}
                    className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 whitespace-nowrap ${
                      isActive ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="founder-dashboard-tab"
                        className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium">
                  {error}
                </motion.div>
              )}
              {actionMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                  {actionMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
              {dashboardTab === "startups" ? (
                <motion.div key="startups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                    <div>
                      <h2 className="text-xl font-bold text-white">Your Startups</h2>
                      <p className="text-sm text-slate-400 mt-1">Manage active startups and sub-ideas.</p>
                    </div>
                    <button
                      onClick={() => setActiveView(activeView === "create" ? "manage" : "create")}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg w-full sm:w-auto"
                    >
                      {activeView === "create" ? <><X className="w-4 h-4"/> Cancel</> : <><Plus className="w-4 h-4"/> Add Startup</>}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeView === "create" ? (
                      <motion.div key="create-form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
                        <CreateStartupForm onClose={() => setActiveView("manage")} onSuccess={handleStartupCreated} />
                      </motion.div>
                    ) : (
                      <motion.div key="manage-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
                        {loading ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                             <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                             <span className="font-medium">Loading startups...</span>
                           </div>
                        ) : startups.length === 0 ? (
                          <div className="text-center py-20 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
                            <LayoutDashboard className="w-12 h-12 text-slate-600 mb-4" />
                            <p className="text-xl font-bold text-white mb-2">No Startups Yet</p>
                            <p className="text-sm text-slate-400">Click &quot;Add Startup&quot; to create your first company profile.</p>
                          </div>
                        ) : (
                          startups.map((startup, i) => (
                            <StartupManageCard
                              key={startup.id}
                              startup={startup}
                              index={i}
                              onUpdate={handleUpdateStartup}
                              onDelete={handleDeleteStartup}
                              onActionMessage={setActionMessage}
                              onRequestAction={handleRequestStatus}
                            />
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                    <div>
                      <h2 className="text-xl font-bold text-white">Investor Plans</h2>
                      <p className="text-sm text-slate-400 mt-1">Post investor plans or funding needs not tied to a specific startup.</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsPlanFormOpen((prev) => !prev);
                        if (!isPlanFormOpen) clearPlanForm();
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg w-full sm:w-auto"
                    >
                      {isPlanFormOpen ? <><X className="w-4 h-4"/> Cancel</> : <><Plus className="w-4 h-4"/> Post Investor Plan</>}
                    </button>
                  </div>

                  {plansError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium">
                      {plansError}
                    </div>
                  )}

                  {isPlanFormOpen && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      onSubmit={handlePlanSubmit}
                      className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10]/80 border border-white/5 shadow-2xl mb-8 space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{editingPlanId ? "Edit Plan" : "Post New Investor Plan"}</h3>
                        <p className="text-sm text-slate-400">Share your investor plan to attract potential investors or partners.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Title</label>
                          <input className={inputClass} value={planFormData.title} onChange={(e) => setPlanFormData((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Next-Gen AI Assistant" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                          <select className={inputClass} value={planFormData.category} onChange={(e) => setPlanFormData((p) => ({ ...p, category: e.target.value, customCategory: e.target.value === "Other" ? p.customCategory : "" }))}>
                            <option value="Tech">Tech</option>
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Finance">Finance</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Other">Other</option>
                          </select>
                          {planFormData.category === "Other" && (
                            <input className={`${inputClass} mt-3`} value={planFormData.customCategory} onChange={(e) => setPlanFormData((p) => ({ ...p, customCategory: e.target.value }))} placeholder="Specify custom category (required)" />
                          )}
                        </div>
                      </div>

                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                         <textarea className={`${inputClass} min-h-[100px] resize-y`} value={planFormData.description} onChange={(e) => setPlanFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the core problem and your solution..." required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Funding Needed (USD)</label>
                          <input className={inputClass} value={planFormData.budget} onChange={(e) => setPlanFormData((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. 50000" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Timeline</label>
                          <input className={inputClass} value={planFormData.timeline} onChange={(e) => setPlanFormData((p) => ({ ...p, timeline: e.target.value }))} placeholder="e.g. 6 Months" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Expected Outcomes</label>
                           <textarea className={`${inputClass} min-h-[100px] resize-y`} value={planFormData.expectedOutcomes} onChange={(e) => setPlanFormData((p) => ({ ...p, expectedOutcomes: e.target.value }))} placeholder="What will this funding achieve?" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Pitch Deck Text</label>
                           <textarea className={`${inputClass} min-h-[100px] resize-y`} value={planFormData.pitchDeckText} onChange={(e) => setPlanFormData((p) => ({ ...p, pitchDeckText: e.target.value }))} placeholder="Paste raw text from your pitch deck (optional)" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <UploadField label="Cover Image" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPlanPhotoFile(e.target.files?.[0] || null)} files={planPhotoFile ? [planPhotoFile] : []} onClear={() => setPlanPhotoFile(null)} helperText="Max 2MB" icon="image" />
                        <UploadField label="Pitch Files" multiple accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,text/plain" onChange={(e) => setPlanPitchFiles(Array.from(e.target.files || []))} files={planPitchFiles} onClear={() => setPlanPitchFiles([])} helperText="PDF, DOCX, Images" />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button type="button" onClick={() => { clearPlanForm(); setIsPlanFormOpen(false); }} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors">
                          Cancel
                        </button>
                        <button type="submit" disabled={planSaving} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50">
                          {planSaving ? "Saving..." : editingPlanId ? "Update Plan" : "Publish Plan"}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {plansLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                       <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                       <span className="font-medium">Loading your plans...</span>
                     </div>
                  ) : plans.length === 0 && !isPlanFormOpen ? (
                    <div className="text-center py-20 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
                      <BriefcaseBusiness className="w-12 h-12 text-slate-600 mb-4" />
                      <p className="text-xl font-bold text-white mb-2">No Investor Plans</p>
                      <p className="text-sm text-slate-400">Post an investor plan or funding mandate to the network.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                      {plans.map((plan) => (
                        <div key={plan._id || plan.id} className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl flex flex-col group">
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white leading-tight mb-1">{plan.title}</h4>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">{plan.category}</span>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => handlePlanEdit(plan)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors" title="Edit">
                                <FileText className="w-4 h-4" />
                              </button>
                              <button onClick={() => handlePlanDelete(plan._id || plan.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">{plan.description}</p>
                          
                          {plan.ImgURL && (
                            <div className="w-full h-40 rounded-xl overflow-hidden mb-6 border border-white/5">
                               <img src={resolveAssetUrl(plan.ImgURL)} alt={plan.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/5">
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Target Funding</p>
                               <p className="text-sm font-bold text-white">{plan.budget ? formatCurrency(plan.budget) : "Unspecified"}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Timeline</p>
                               <p className="text-sm font-bold text-white">{plan.timeline || "Flexible"}</p>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                                                    */
/* ------------------------------------------------------------------------------------------------- */

function StartupManageCard({ startup, index, onUpdate, onDelete, onActionMessage, onRequestAction }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: startup.name, description: startup.description, BR: startup.BR, status: startup.status });

  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState("");
  const [ideaFormOpen, setIdeaFormOpen] = useState(false);
  const [ideaFormData, setIdeaFormData] = useState({ title: "", description: "", category: "Tech", customCategory: "", budget: "", timeline: "", expectedOutcomes: "", pitchDeckText: "" });
  const [ideaPhotoFile, setIdeaPhotoFile] = useState(null);
  const [ideaPitchFiles, setIdeaPitchFiles] = useState([]);
  const [startupLogoFile, setStartupLogoFile] = useState(null);
  const [ideaSaving, setIdeaSaving] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);

  const statusConfig = {
    draft: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Draft" },
    pending: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Pending Review" },
    approved: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Approved" },
    notapproved: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Not Approved" },
    rejected: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Rejected" }
  };

  const status = statusConfig[String(startup.status).toLowerCase()] || statusConfig.draft;
  const fundingPercent = startup.fundingGoal > 0 ? Math.round((startup.currentFunding / startup.fundingGoal) * 100) : 0;
  const pendingRequests = startup.investorRequests.filter((r) => r.status === "pending" || r.status === "pending_founder" || r.status === "pending_investor" || r.status === "pending_mentor").length;

  useEffect(() => { setFormData({ name: startup.name, description: startup.description, BR: startup.BR, status: startup.status }); }, [startup]);

  useEffect(() => {
    if (expanded) {
      (async () => {
        setIdeasLoading(true); setIdeasError("");
        try {
          const res = await api.get(`/v1/ideas/startup/${startup.id}`);
          setIdeas(res?.data?.data || []);
        } catch {
          setIdeasError("Failed to load ideas for this startup.");
        } finally {
          setIdeasLoading(false);
        }
      })();
    }
  }, [expanded, startup.id]);

  const clearIdeaForm = () => {
    setIdeaFormData({ title: "", description: "", category: "Tech", customCategory: "", budget: "", timeline: "", expectedOutcomes: "", pitchDeckText: "" });
    setIdeaPhotoFile(null); setIdeaPitchFiles([]); setEditingIdeaId(null);
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    if (!ideaFormData.title.trim() || !ideaFormData.description.trim()) return setIdeasError("Title and description are required.");
    setIdeaSaving(true); setIdeasError("");

    try {
      const form = new FormData();
      form.append("title", ideaFormData.title); form.append("description", ideaFormData.description);
      form.append("category", ideaFormData.category); if (ideaFormData.category === "Other") form.append("customCategory", ideaFormData.customCategory || ""); form.append("budget", String(ideaFormData.budget || 0));
      form.append("timeline", ideaFormData.timeline || ""); form.append("expectedOutcomes", ideaFormData.expectedOutcomes || "");
      form.append("pitchDeckText", ideaFormData.pitchDeckText || ""); form.append("isIdea", "true"); form.append("StartupId", startup.id);
      if (ideaPhotoFile) form.append("photo", ideaPhotoFile);
      Array.from(ideaPitchFiles || []).forEach((file) => form.append("pitchDeckFiles", file));

      if (editingIdeaId) {
        await api.put(`/v1/ideas/${editingIdeaId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        onActionMessage?.("Idea updated successfully.");
      } else {
        await api.post("/v1/ideas", form, { headers: { "Content-Type": "multipart/form-data" } });
        onActionMessage?.("Idea created successfully.");
      }
      clearIdeaForm(); setIdeaFormOpen(false);
      const res = await api.get(`/v1/ideas/startup/${startup.id}`);
      setIdeas(res?.data?.data || []);
    } catch (e) {
      setIdeasError(e?.response?.data?.message || "Failed to save idea.");
    } finally {
      setIdeaSaving(false);
    }
  };

  const handleIdeaEdit = (idea) => {
    setEditingIdeaId(idea._id || idea.id);
    setIdeaFormData({
      title: idea.title || "", description: idea.description || "", category: idea.category || "Tech",
      customCategory: idea.customCategory || "",
      budget: idea.budget || "", timeline: idea.timeline || "", expectedOutcomes: idea.expectedOutcomes || "", pitchDeckText: idea.pitchDeckText || ""
    });
    setIdeaPhotoFile(null); setIdeaPitchFiles([]); setIdeaFormOpen(true);
  };

  const handleIdeaDelete = async (ideaId) => {
    if (!window.confirm("Delete this idea?")) return;
    try {
      await api.delete(`/v1/ideas/${ideaId}`);
      onActionMessage?.("Idea deleted successfully.");
      const res = await api.get(`/v1/ideas/startup/${startup.id}`);
      setIdeas(res?.data?.data || []);
    } catch (e) {
      setIdeasError(e?.response?.data?.message || "Failed to delete idea.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    const normalizedStatus = formData.status === "approved" ? "Approved" : formData.status === "notapproved" ? "NotApproved" : "pending";
    // If a logo file was selected, submit as FormData so the file can be uploaded
    if (startupLogoFile) {
      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("description", formData.description || "");
      form.append("BR", formData.BR || "");
      form.append("status", normalizedStatus);
      form.append("photo", startupLogoFile);
      await onUpdate?.(startup.id, form);
      setStartupLogoFile(null);
    } else {
      await onUpdate?.(startup.id, { name: formData.name.trim(), description: formData.description, BR: formData.BR, status: normalizedStatus });
    }
    setIsEditing(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl overflow-hidden">
      {/* Header Row (Accordion Toggle) */}
      <button onClick={() => setExpanded(!expanded)} className="w-full p-6 md:p-8 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-lg font-black text-white shrink-0 overflow-hidden shadow-inner">
            {startup.logoUrl ? <img src={startup.logoUrl} alt={`${startup.name} logo`} className="w-full h-full object-cover" /> : startup.logoInitials}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="text-xl font-bold text-white truncate">{startup.name}</h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${status.color}`}>
                {status.label}
              </span>
              {pendingRequests > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.2)]">
                  {pendingRequests} Action Required
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 line-clamp-1">{startup.tagline}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-slate-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="px-6 md:px-8 pb-8 pt-2 border-t border-white/5 space-y-8">
              
              {/* Edit/Delete Controls */}
              <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
                {!isEditing ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors shadow-sm">
                      Edit Details
                    </button>
                    <button onClick={async (e) => { e.stopPropagation(); if (window.confirm("Are you sure you want to delete this startup?")) await onDelete?.(startup.id); }} className="px-5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold text-red-400 transition-colors shadow-sm">
                      Delete Startup
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSave} className="w-full space-y-4 bg-[#1A1D24]/50 p-5 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Startup Name</label>
                         <input className={inputClass} value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Startup name" />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Business Reg (BR)</label>
                         <input className={inputClass} value={formData.BR} onChange={(e) => setFormData((prev) => ({ ...prev, BR: e.target.value }))} placeholder="BR Number" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                      <textarea className={`${inputClass} min-h-[100px] resize-y`} value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Brief description" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UploadField label="Startup Logo" accept="image/png,image/jpeg,image/webp" onChange={(e) => setStartupLogoFile(e.target.files?.[0] || null)} files={startupLogoFile ? [startupLogoFile] : []} onClear={() => setStartupLogoFile(null)} icon="image" />
                      <div />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats Grid */}
              {startup.status !== "draft" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {startup.fundingGoal > 0 && (
                    <StatCard icon={DollarSign} label="Target Goal" value={formatCurrency(startup.fundingGoal)} />
                  )}

                  {startup.currentFunding > 0 && (
                    <StatCard icon={DollarSign} label="Capital Raised" value={formatCurrency(startup.currentFunding)} />
                  )}

                  {startup.investorRequests && startup.investorRequests.length > 0 && (
                    <StatCard icon={Users} label="Total Investors" value={String(startup.investorRequests.length)} />
                  )}

                  {/* Current Stage card removed per request */}
                </div>
              )}

              {/* Progress Bar */}
              {startup.fundingGoal > 0 && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wider">
                    <span className="text-slate-400">Funding Progress</span>
                    <span className="text-blue-400">{fundingPercent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#1A1D24] overflow-hidden shadow-inner border border-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${fundingPercent}%` }} />
                  </div>
                </div>
              )}

              {/* Investor Requests Section */}
              {startup.investorRequests.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" /> Actionable Requests
                  </h4>
                  <div className="space-y-4">
                    {startup.investorRequests.map((req) => (
                      <InvestorRequestCard key={req.id} request={req} startupId={startup.id} onAction={onRequestAction} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Ideas Section */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Associated Pitch Ideas</h4>
                  <button
                    onClick={() => { setIdeaFormOpen((prev) => !prev); if (!ideaFormOpen) clearIdeaForm(); }}
                    className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-colors"
                  >
                    {ideaFormOpen ? "Close Form" : "+ Add Idea"}
                  </button>
                </div>

                {ideasError && <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{ideasError}</p>}

                <AnimatePresence>
                  {ideaFormOpen && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleIdeaSubmit} className="space-y-5 mb-8 rounded-2xl border border-white/10 bg-[#1A1D24]/50 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Idea Title</label>
                            <input className={inputClass} value={ideaFormData.title} onChange={(e) => setIdeaFormData((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Mobile App Expansion" required />
                         </div>
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                            <select className={inputClass} value={ideaFormData.category} onChange={(e) => setIdeaFormData((p) => ({ ...p, category: e.target.value, customCategory: e.target.value === "Other" ? p.customCategory : "" }))}>
                              <option value="Tech">Tech</option>
                              <option value="Health">Health</option>
                              <option value="Education">Education</option>
                              <option value="Finance">Finance</option>
                              <option value="Agriculture">Agriculture</option>
                              <option value="Other">Other</option>
                            </select>
                            {ideaFormData.category === "Other" && (
                              <input className={`${inputClass} mt-3`} value={ideaFormData.customCategory} onChange={(e) => setIdeaFormData((p) => ({ ...p, customCategory: e.target.value }))} placeholder="Specify custom category (required)" />
                            )}
                         </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                         <textarea className={`${inputClass} min-h-[80px] resize-y`} value={ideaFormData.description} onChange={(e) => setIdeaFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Explain the concept..." required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Budget Needed</label>
                           <input className={inputClass} value={ideaFormData.budget} onChange={(e) => setIdeaFormData((p) => ({ ...p, budget: e.target.value }))} placeholder="USD Amount" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Timeline</label>
                           <input className={inputClass} value={ideaFormData.timeline} onChange={(e) => setIdeaFormData((p) => ({ ...p, timeline: e.target.value }))} placeholder="e.g. Q3 2026" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <UploadField label="Cover Image" accept="image/png,image/jpeg,image/webp" onChange={(e) => setIdeaPhotoFile(e.target.files?.[0] || null)} files={ideaPhotoFile ? [ideaPhotoFile] : []} onClear={() => setIdeaPhotoFile(null)} icon="image" />
                        <UploadField label="Pitch Deck" multiple accept="application/pdf,.doc,.docx,image/*" onChange={(e) => setIdeaPitchFiles(Array.from(e.target.files || []))} files={ideaPitchFiles} onClear={() => setIdeaPitchFiles([])} />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button type="button" onClick={() => { clearIdeaForm(); setIdeaFormOpen(false); }} className="px-5 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition-colors">Cancel</button>
                        <button type="submit" disabled={ideaSaving} className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                          {ideaSaving ? "Saving..." : editingIdeaId ? "Update Idea" : "Post Idea"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {ideasLoading ? (
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-400"><Loader className="w-4 h-4 animate-spin"/> Loading ideas...</div>
                ) : ideas.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500 italic">No specific ideas posted under this startup yet.</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {ideas.map((idea) => (
                      <div key={idea._id || idea.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-base font-bold text-white">{idea.title}</h5>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mt-1">{idea.category} • {idea.status}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleIdeaEdit(idea)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleIdeaDelete(idea._id || idea.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">{idea.description}</p>
                        <div className="flex gap-4 border-t border-white/5 pt-3">
                           <div>
                             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Budget</p>
                             <p className="text-xs font-bold text-white">{idea.budget ? formatCurrency(idea.budget) : "-"}</p>
                           </div>
                           <div>
                             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Timeline</p>
                             <p className="text-xs font-bold text-white">{idea.timeline || "-"}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="p-5 rounded-2xl bg-[#1A1D24]/50 border border-white/5 text-center flex flex-col items-center justify-center">
      <Icon className="w-6 h-6 text-blue-400 mb-3" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function UploadField({ label, accept, multiple = false, onChange, files = [], onClear, helperText, icon = "file" }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#1A1D24] p-4 shadow-inner">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 block ml-1">{label}</label>
      <label className="flex items-center justify-between gap-3 cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
          {icon === "image" ? <ImageUp className="w-5 h-5 text-blue-400" /> : <Upload className="w-5 h-5 text-blue-400" />}
          <span>{multiple ? "Choose files..." : "Choose file..."}</span>
        </div>
        <input type="file" multiple={multiple} accept={accept} onChange={onChange} className="hidden" />
      </label>

      {helperText && <p className="text-[10px] font-medium text-slate-500 mt-2 ml-1">{helperText}</p>}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 border border-white/5 px-3 py-2">
              <div className="min-w-0 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-xs font-bold text-slate-200 truncate">{file.name}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 shrink-0">{formatFileSize(file.size)}</span>
            </div>
          ))}
          <button type="button" onClick={onClear} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 ml-1">
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

function InvestorRequestCard({ request, startupId, onAction }) {
  const statusIcons = {
    pending_founder: <Clock className="w-4 h-4 text-yellow-400" />,
    pending_investor: <Clock className="w-4 h-4 text-yellow-400" />,
    pending_mentor: <Clock className="w-4 h-4 text-yellow-400" />,
    approved: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    rejected: <XCircle className="w-4 h-4 text-red-400" />,
    withdrawn: <XCircle className="w-4 h-4 text-slate-500" />
  };

  const statusColors = {
    pending_founder: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    pending_investor: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    pending_mentor: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    approved: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/10 border-red-500/20 text-red-400",
    withdrawn: "bg-slate-500/10 border-slate-500/20 text-slate-400"
  };

  const normalizedStatus = request.status || "pending";
  const canFounderDecide = normalizedStatus === "pending_founder" || normalizedStatus === "pending";
  const canWithdraw = normalizedStatus === "pending_founder" || normalizedStatus === "pending_investor" || normalizedStatus === "pending";

  const requestedUserName = request.createdBy?.name || request.investorName;
  const requestedUserEmail = request.createdBy?.email || request.investorId?.email;

  return (
    <div className="p-5 rounded-2xl bg-[#1A1D24] border border-white/5 shadow-inner">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg">
          {request.investorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <p className="text-base font-bold text-white">{request.investorName}</p>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest w-fit ${statusColors[normalizedStatus] || statusColors.pending_founder}`}>
              {statusIcons[normalizedStatus] || statusIcons.pending_founder}
              {normalizedStatus.replace("_", " ")}
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 mb-3">
            {requestedUserName} {requestedUserEmail ? ` • ${requestedUserEmail}` : ""}
          </p>
          
          <div className="bg-[#0B0D10] rounded-xl p-4 border border-white/5 mb-4">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Proposed Capital</p>
             <p className="text-2xl font-black text-emerald-400 mb-3">{formatCurrency(request.amount)}</p>
             {request.message && (
               <>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Message</p>
                 <p className="text-sm text-slate-300 italic leading-relaxed">&quot;{request.message}&quot;</p>
               </>
             )}
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">
            Requested on {request.date}
          </p>

          {(canFounderDecide || canWithdraw) && (
            <div className="flex flex-wrap gap-3">
              {canFounderDecide && (
                <>
                  <button onClick={() => onAction?.(startupId, request, "approved")} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    Approve Deal
                  </button>
                  <button onClick={() => onAction?.(startupId, request, "rejected")} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-colors">
                    Reject
                  </button>
                </>
              )}
              {canWithdraw && (
                <button onClick={() => onAction?.(startupId, request, "withdrawn")} className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-colors">
                  Withdraw Request
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateStartupForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", description: "", BR: "", status: "pending" });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { fetchMe } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Startup name is required.");
    setSubmitting(true); setError("");

    try {
      const me = await fetchMe();
      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("description", formData.description.trim() || "");
      form.append("BR", formData.BR.trim() || "");
      form.append("status", "pending");
      form.append("UserID", me._id || me.id);
      form.append("createdBy", me._id || me.id);
      if (photoFile) form.append("photo", photoFile);

      const res = await api.post("/v1/startups", form, { headers: { "Content-Type": "multipart/form-data" } });
      onSuccess?.(res.data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create startup.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={onSubmit} className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10]/80 border border-white/5 shadow-2xl space-y-6 max-w-3xl">
      <div>
         <h2 className="text-2xl font-black text-white mb-1">Add New Startup</h2>
         <p className="text-sm text-slate-400 font-medium">Create a verifiable profile to attract smart capital and mentors.</p>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Startup Name</label>
          <input className={inputClass} placeholder="e.g. QuantumLeap AI" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Business Registration (BR)</label>
          <input className={inputClass} placeholder="Official BR Number" value={formData.BR} onChange={(e) => setFormData((prev) => ({ ...prev, BR: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Core Mission / Tagline</label>
        <textarea className={`${inputClass} min-h-[100px] resize-y`} placeholder="Describe your startup, the problem you solve, and your unique advantage..." value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
      </div>

      <UploadField label="Company Logo or Banner" accept="image/png,image/jpeg,image/webp" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} files={photoFile ? [photoFile] : []} onClear={() => setPhotoFile(null)} helperText="Landscape image under 2MB" icon="image" />

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit for Verification"}
        </button>
      </div>
    </motion.form>
  );
}

export default StartupOwnerDashboard;