// StartupOwnerDashboard.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useAuth } from "@/features/auth/useAuth";
import api from "@/lib/axios";
import { formatCurrency } from "@/data/mockData";
import {
  Plus,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Users,
  Rocket,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";

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
    budget: "",
    timeline: "",
    expectedOutcomes: ""
  });
  const [planSaving, setPlanSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);

  const normalizeRequest = (request) => {
    const investorName =
      request.investorId?.name || request.createdBy?.name || "Unknown Investor";
    const investorAvatar = investorName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return {
      id: request._id || request.id,
      status: (request.requestStatus || "pending").toLowerCase(),
      amount: request.amount || 0,
      message: request.message || "",
      date:
        request.createdUtc || request.createdAt
          ? new Date(
              request.createdUtc || request.createdAt
            ).toLocaleDateString()
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
    fundingGoal: Number(startup.fundingGoal || 0),
    currentFunding: Number(startup.currentFunding || 0),
    investorRequests: startup.investorRequests || [],
    logo:
      (startup.name ? startup.name.slice(0, 2).toUpperCase() : "SU") || "SU",
    raw: startup
  });

  const fetchStartups = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    setActionMessage("");

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
          } catch {
            // ignore, keep existing or empty requests
          }

          return normalizeStartup({ ...startup, investorRequests });
        })
      );

      setStartups(enriched);
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to load startups.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    if (!user) return;
    setPlansLoading(true);
    setPlansError("");

    try {
      const res = await api.get("/v1/ideas/plans");
      const userId = user?.id || user?._id;
      const allPlans = res?.data?.data || [];
      const myPlans = allPlans.filter(
        (p) => String(p.createdBy) === String(userId)
      );
      setPlans(myPlans);
    } catch (e) {
      setPlansError(
        e?.response?.data?.message || "Failed to load investment plans."
      );
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (dashboardTab === "plans") {
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardTab, user]);

  const handleStartupCreated = (startup) => {
    setStartups((prev) => [normalizeStartup(startup), ...prev]);
    setActionMessage("Startup successfully created.");
    setActiveView("manage");
  };

  const handleUpdateStartup = async (startupId, payload) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.put(`/v1/startups/${startupId}`, payload);
      const updated = normalizeStartup(res?.data?.data);
      setStartups((prev) =>
        prev.map((s) => (s.id === startupId ? updated : s))
      );
      setActionMessage("Startup updated successfully.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update startup.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStartup = async (startupId) => {
    try {
      setLoading(true);
      setError("");
      await api.delete(`/v1/startups/${startupId}`);
      setStartups((prev) => prev.filter((s) => s.id !== startupId));
      setActionMessage("Startup deleted successfully.");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete startup.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStatus = async (startupId, requestId, status) => {
    try {
      setLoading(true);
      setError("");

      await api.patch(`/v1/requests/${requestId}/status`, {
        requestStatus: status,
        updatedBy: user?.id || user?._id
      });

      // Refresh one startup's request list
      const reqRes = await api.get(`/v1/requests/startup/${startupId}`);
      const investorRequests = (reqRes?.data?.data || []).map(normalizeRequest);

      setStartups((prev) =>
        prev.map((s) => (s.id === startupId ? { ...s, investorRequests } : s))
      );
      setActionMessage(`Request ${status} successfully.`);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Failed to update request status."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearPlanForm = () => {
    setPlanFormData({
      title: "",
      description: "",
      category: "Tech",
      budget: "",
      timeline: "",
      expectedOutcomes: ""
    });
    setEditingPlanId(null);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();

    if (!planFormData.title.trim() || !planFormData.description.trim()) {
      setPlansError("Title and description are required.");
      return;
    }

    setPlanSaving(true);
    setPlansError("");

    try {
      if (editingPlanId) {
        await api.put(`/v1/ideas/${editingPlanId}`, {
          ...planFormData,
          isIdea: false
        });
        setActionMessage("Investment plan updated successfully.");
      } else {
        await api.post("/v1/ideas", {
          ...planFormData,
          isIdea: false
        });
        setActionMessage("Investment plan created successfully.");
      }

      clearPlanForm();
      setIsPlanFormOpen(false);
      loadPlans();
    } catch (e) {
      setPlansError(
        e?.response?.data?.message || "Failed to save investment plan."
      );
    } finally {
      setPlanSaving(false);
    }
  };

  const handlePlanEdit = (plan) => {
    setEditingPlanId(plan._id || plan.id);
    setPlanFormData({
      title: plan.title || "",
      description: plan.description || "",
      category: plan.category || "Tech",
      budget: plan.budget || "",
      timeline: plan.timeline || "",
      expectedOutcomes: plan.expectedOutcomes || ""
    });
    setIsPlanFormOpen(true);
  };

  const handlePlanDelete = async (planId) => {
    if (!confirm("Delete this investment plan?")) return;

    try {
      await api.delete(`/v1/ideas/${planId}`);
      setActionMessage("Investment plan deleted successfully.");
      loadPlans();
    } catch (e) {
      setPlansError(
        e?.response?.data?.message || "Failed to delete investment plan."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 w-full overflow-y-auto px-4 md:px-8 pt-28 pb-12 max-w-7xl lg:ml-64">
          {/* Top tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setDashboardTab("startups")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                dashboardTab === "startups"
                  ? "gradient-blue text-white"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              Startups + Ideas
            </button>
            <button
              onClick={() => setDashboardTab("plans")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                dashboardTab === "plans"
                  ? "gradient-blue text-white"
                  : "bg-white/5 text-muted-foreground"
              }`}
            >
              Investor Plans
            </button>
          </div>

          {dashboardTab === "startups" ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl heading-tight">Founder Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your startups and investor relations.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setActiveView(activeView === "create" ? "manage" : "create")
                  }
                  className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full gradient-blue text-sm font-semibold glow-blue transition-all"
                >
                  {activeView === "create" ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {activeView === "create" ? "Cancel" : "Add Startup"}
                </motion.button>
              </div>

              {Boolean(error) && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {Boolean(actionMessage) && (
                <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
                  {actionMessage}
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeView === "create" ? (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CreateStartupForm
                      onClose={() => setActiveView("manage")}
                      onSuccess={handleStartupCreated}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="manage"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {loading && (
                      <div className="text-sm text-muted-foreground">
                        Loading your startups…
                      </div>
                    )}
                    {!loading && startups.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No startups yet. Add your first one.
                      </div>
                    )}
                    {startups.map((startup, i) => (
                      <StartupManageCard
                        key={startup.id}
                        startup={startup}
                        index={i}
                        onUpdate={handleUpdateStartup}
                        onDelete={handleDeleteStartup}
                        onActionMessage={setActionMessage}
                        onRequestAction={handleRequestStatus}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl heading-tight">Investor Plans</h1>
                  <p className="text-muted-foreground mt-1">
                    Submit and manage your investor plans without attaching a
                    startup.
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setIsPlanFormOpen((prev) => !prev);
                    if (isPlanFormOpen) clearPlanForm();
                  }}
                  className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full gradient-blue text-sm font-semibold glow-blue transition-all"
                >
                  {isPlanFormOpen ? "Cancel" : "Add Plan"}
                </motion.button>
              </div>

              {Boolean(plansError) && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {plansError}
                </div>
              )}
              {Boolean(actionMessage) && (
                <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
                  {actionMessage}
                </div>
              )}

              {isPlanFormOpen && (
                <form
                  onSubmit={handlePlanSubmit}
                  className="obsidian-card p-5 mb-6 space-y-4"
                >
                  <h3 className="text-lg font-semibold">
                    {editingPlanId ? "Edit" : "New"} Investment Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={planFormData.title}
                      onChange={(e) =>
                        setPlanFormData((prev) => ({
                          ...prev,
                          title: e.target.value
                        }))
                      }
                      placeholder="Title"
                      required
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={planFormData.category}
                      onChange={(e) =>
                        setPlanFormData((prev) => ({
                          ...prev,
                          category: e.target.value
                        }))
                      }
                      placeholder="Category"
                    />
                  </div>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                    value={planFormData.description}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        description: e.target.value
                      }))
                    }
                    placeholder="Description"
                    rows={3}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={planFormData.budget}
                      onChange={(e) =>
                        setPlanFormData((prev) => ({
                          ...prev,
                          budget: e.target.value
                        }))
                      }
                      placeholder="Budget"
                    />
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={planFormData.timeline}
                      onChange={(e) =>
                        setPlanFormData((prev) => ({
                          ...prev,
                          timeline: e.target.value
                        }))
                      }
                      placeholder="Timeline"
                    />
                  </div>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 text-sm"
                    value={planFormData.expectedOutcomes}
                    onChange={(e) =>
                      setPlanFormData((prev) => ({
                        ...prev,
                        expectedOutcomes: e.target.value
                      }))
                    }
                    placeholder="Expected Outcomes"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearPlanForm();
                        setIsPlanFormOpen(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-white/5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={planSaving}
                      className="px-4 py-2 rounded-lg gradient-blue text-sm font-semibold"
                    >
                      {planSaving
                        ? "Saving..."
                        : editingPlanId
                          ? "Update Plan"
                          : "Create Plan"}
                    </button>
                  </div>
                </form>
              )}

              {plansLoading ? (
                <p className="text-sm text-muted-foreground">Loading plans…</p>
              ) : plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No investment plans yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan._id || plan.id}
                      className="obsidian-card p-4"
                    >
                      <div className="flex justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold">{plan.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {plan.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlanEdit(plan)}
                            className="px-3 py-1 rounded-full bg-white/10 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handlePlanDelete(plan._id || plan.id)
                            }
                            className="px-3 py-1 rounded-full bg-destructive/20 text-xs text-destructive"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{plan.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Budget: {plan.budget || "-"}, Timeline:{" "}
                        {plan.timeline || "-"}
                      </p>
                      {plan.expectedOutcomes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expected: {plan.expectedOutcomes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

function StartupManageCard({
  startup,
  index,
  onUpdate,
  onDelete,
  onActionMessage,
  onRequestAction
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: startup.name,
    description: startup.description,
    BR: startup.BR,
    status: startup.status
  });

  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState("");
  const [ideaFormOpen, setIdeaFormOpen] = useState(false);
  const [ideaFormData, setIdeaFormData] = useState({
    title: "",
    description: "",
    category: "Tech",
    budget: "",
    timeline: "",
    expectedOutcomes: ""
  });
  const [ideaSaving, setIdeaSaving] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);

  const statusConfig = {
    draft: {
      color: "bg-muted text-muted-foreground border-white/10",
      label: "Draft"
    },
    pending: {
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      label: "Pending Review"
    },
    approved: {
      color: "bg-accent/20 text-accent border-accent/30",
      label: "Approved"
    },
    notapproved: {
      color: "bg-destructive/20 text-destructive border-destructive/30",
      label: "Not Approved"
    },
    rejected: {
      color: "bg-destructive/20 text-destructive border-destructive/30",
      label: "Rejected"
    }
  };

  const status =
    statusConfig[String(startup.status).toLowerCase()] || statusConfig.draft;
  const fundingPercent =
    startup.fundingGoal > 0
      ? Math.round((startup.currentFunding / startup.fundingGoal) * 100)
      : 0;
  const pendingRequests = startup.investorRequests.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "pending_founder" ||
      r.status === "pending_mentor"
  ).length;

  useEffect(() => {
    setFormData({
      name: startup.name,
      description: startup.description,
      BR: startup.BR,
      status: startup.status
    });
  }, [startup]);

  useEffect(() => {
    if (expanded) {
      (async () => {
        setIdeasLoading(true);
        setIdeasError("");
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
    setIdeaFormData({
      title: "",
      description: "",
      category: "Tech",
      budget: "",
      timeline: "",
      expectedOutcomes: ""
    });
    setEditingIdeaId(null);
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();

    if (!ideaFormData.title.trim() || !ideaFormData.description.trim()) {
      setIdeasError("Title and description are required.");
      return;
    }

    setIdeaSaving(true);
    setIdeasError("");

    try {
      if (editingIdeaId) {
        await api.put(`/v1/ideas/${editingIdeaId}`, {
          ...ideaFormData,
          isIdea: true
        });
        onActionMessage?.("Idea updated successfully.");
      } else {
        await api.post("/v1/ideas", {
          ...ideaFormData,
          StartupId: startup.id,
          isIdea: true
        });
        onActionMessage?.("Idea created successfully.");
      }
      clearIdeaForm();
      setIdeaFormOpen(false);
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
      title: idea.title || "",
      description: idea.description || "",
      category: idea.category || "Tech",
      budget: idea.budget || "",
      timeline: idea.timeline || "",
      expectedOutcomes: idea.expectedOutcomes || ""
    });
    setIdeaFormOpen(true);
  };

  const handleIdeaDelete = async (ideaId) => {
    if (!confirm("Delete this idea?")) return;

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

    const normalizedStatus =
      formData.status === "approved"
        ? "Approved"
        : formData.status === "notapproved"
          ? "NotApproved"
          : "pending";

    await onUpdate?.(startup.id, {
      name: formData.name.trim(),
      description: formData.description,
      BR: formData.BR,
      status: normalizedStatus
    });

    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="obsidian-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-sm font-bold shrink-0">
          {startup.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold">{startup.name}</h3>
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}
            >
              {status.label}
            </span>
            {pendingRequests > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {pendingRequests} pending request
                {pendingRequests > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {startup.tagline}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/[0.07] pt-5">
              <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium hover:bg-white/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (
                          !confirm(
                            "Are you sure you want to delete this startup?"
                          )
                        )
                          return;
                        await onDelete?.(startup.id);
                      }}
                      className="px-3 py-1.5 rounded-full bg-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSave} className="w-full space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 focus:outline-none focus:ring-primary/50 text-sm"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value
                          }))
                        }
                        placeholder="Startup name"
                      />
                      <input
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 focus:outline-none focus:ring-primary/50 text-sm"
                        value={formData.BR}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            BR: e.target.value
                          }))
                        }
                        placeholder="Business Registration"
                      />
                    </div>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/8 focus:outline-none focus:ring-primary/50 text-sm"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-full gradient-blue text-xs font-semibold glow-blue"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsEditing(false);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stats row */}
              {startup.status !== "draft" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    icon={DollarSign}
                    label="Goal"
                    value={formatCurrency(startup.fundingGoal)}
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Raised"
                    value={formatCurrency(startup.currentFunding)}
                  />
                  <StatCard
                    icon={Users}
                    label="Investors"
                    value={String(startup.investorRequests.length)}
                  />
                  <StatCard icon={Rocket} label="Stage" value={startup.stage} />
                </div>
              )}

              {/* Funding progress */}
              {startup.fundingGoal > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Funding Progress</span>
                    <span>{fundingPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-blue"
                      style={{ width: `${fundingPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Investor Requests */}
              {startup.investorRequests.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Investor Requests
                  </h4>
                  <div className="space-y-3">
                    {startup.investorRequests.map((req) => (
                      <InvestorRequestCard
                        key={req.id}
                        request={req}
                        startupId={startup.id}
                        onAction={onRequestAction}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Startup Ideas */}
              <div className="border-t border-white/[0.07] pt-5 mt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Startup Ideas</h4>
                  <button
                    onClick={() => {
                      setIdeaFormOpen((prev) => !prev);
                      if (ideaFormOpen) clearIdeaForm();
                    }}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium"
                  >
                    {ideaFormOpen ? "Hide Form" : "Add Idea"}
                  </button>
                </div>

                {ideasError && (
                  <p className="text-xs text-destructive mb-2">{ideasError}</p>
                )}

                {ideaFormOpen && (
                  <form onSubmit={handleIdeaSubmit} className="space-y-2 mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                        value={ideaFormData.title}
                        onChange={(e) =>
                          setIdeaFormData((prev) => ({
                            ...prev,
                            title: e.target.value
                          }))
                        }
                        placeholder="Idea title"
                        required
                      />
                      <input
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                        value={ideaFormData.category}
                        onChange={(e) =>
                          setIdeaFormData((prev) => ({
                            ...prev,
                            category: e.target.value
                          }))
                        }
                        placeholder="Category"
                      />
                    </div>
                    <textarea
                      className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={ideaFormData.description}
                      onChange={(e) =>
                        setIdeaFormData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                      placeholder="Description"
                      rows={3}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                        value={ideaFormData.budget}
                        onChange={(e) =>
                          setIdeaFormData((prev) => ({
                            ...prev,
                            budget: e.target.value
                          }))
                        }
                        placeholder="Budget"
                      />
                      <input
                        className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                        value={ideaFormData.timeline}
                        onChange={(e) =>
                          setIdeaFormData((prev) => ({
                            ...prev,
                            timeline: e.target.value
                          }))
                        }
                        placeholder="Timeline"
                      />
                    </div>
                    <textarea
                      className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm"
                      value={ideaFormData.expectedOutcomes}
                      onChange={(e) =>
                        setIdeaFormData((prev) => ({
                          ...prev,
                          expectedOutcomes: e.target.value
                        }))
                      }
                      placeholder="Expected outcomes"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          clearIdeaForm();
                          setIdeaFormOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/10 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={ideaSaving}
                        className="px-3 py-1.5 rounded-full gradient-blue text-xs font-semibold"
                      >
                        {ideaSaving
                          ? "Saving..."
                          : editingIdeaId
                            ? "Update Idea"
                            : "Create Idea"}
                      </button>
                    </div>
                  </form>
                )}

                {ideasLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading ideas…
                  </p>
                ) : ideas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No ideas yet. Add your first idea.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {ideas.map((idea) => (
                      <div
                        key={idea._id || idea.id}
                        className="p-3 rounded-xl bg-white/3 border border-white/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-semibold">
                              {idea.title}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              {idea.category} • {idea.status}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleIdeaEdit(idea)}
                              className="px-2 py-1 rounded-full bg-white/10 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleIdeaDelete(idea._id || idea.id)
                              }
                              className="px-2 py-1 rounded-full bg-destructive/20 text-xs text-destructive"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {idea.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Budget: {idea.budget || "-"}, Timeline:{" "}
                          {idea.timeline || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {startup.status === "draft" && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm mb-3">
                    This startup is in draft. Complete the profile to submit for
                    review.
                  </p>
                  <button className="pill-filter pill-filter-active">
                    Complete Profile
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-white/3 text-center">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function InvestorRequestCard({ request, startupId, onAction }) {
  const statusIcons = {
    pending_founder: <Clock className="w-4 h-4 text-yellow-400" />,
    pending_mentor: <Clock className="w-4 h-4 text-yellow-400" />,
    approved: <CheckCircle2 className="w-4 h-4 text-accent" />,
    rejected: <XCircle className="w-4 h-4 text-destructive" />,
    withdrawn: <XCircle className="w-4 h-4 text-destructive" />
  };

  const normalizedStatus = request.status || "pending";
  const isPending =
    normalizedStatus === "pending_founder" ||
    normalizedStatus === "pending_mentor" ||
    normalizedStatus === "pending";

  const requestedUserName = request.createdBy?.name || request.investorName;
  const requestedUserEmail =
    request.createdBy?.email || request.investorId?.email;

  const handleAction = (actionStatus) => {
    onAction?.(startupId, request.id, actionStatus);
  };

  return (
    <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold shrink-0">
          {request.investorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{request.investorName}</p>
            <div className="flex items-center gap-1.5">
              {statusIcons[normalizedStatus] || statusIcons.pending_founder}
              <span className="text-xs text-muted-foreground capitalize">
                {normalizedStatus.replace("_", " ")}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requested by {requestedUserName}
            {requestedUserEmail ? ` • ${requestedUserEmail}` : ""}
          </p>
          <p className="text-sm font-semibold text-primary mt-0.5">
            {formatCurrency(request.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {request.message}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5">
            {request.date}
          </p>

          {isPending && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAction("approved")}
                className="flex-1 py-1.5 rounded-full gradient-blue text-xs font-semibold"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction("rejected")}
                className="flex-1 py-1.5 rounded-full bg-white/5 border border-white/[0.07] text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction("withdrawn")}
                className="flex-1 py-1.5 rounded-full bg-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/30 transition-colors"
              >
                Withdraw
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateStartupForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    BR: "",
    status: "pending"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { fetchMe } = useAuth();

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Startup name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const me = await fetchMe();
      console.log("Fetched user data:", me);
      const res = await api.post("/v1/startups", {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        BR: formData.BR.trim() || null,
        status: "pending",
        UserID: me._id || me.id,
        createdBy: me._id || me.id
      });
      setSubmitted(true);
      onSuccess?.(res.data?.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create startup.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="obsidian-card p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Startup Submitted!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your startup has been submitted for review. You&apos;ll be notified
          once approved.
        </p>
        <button onClick={onClose} className="pill-filter pill-filter-active">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="obsidian-card p-6 max-w-2xl space-y-5">
      <h2 className="text-xl font-semibold">Submit New Startup</h2>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">
          Startup Name
        </label>
        <input
          className={inputClass}
          placeholder="e.g. QuantumLeap"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">
          Description
        </label>
        <textarea
          className={`${inputClass} min-h-25 resize-none`}
          placeholder="Describe your startup, the problem you solve, and your unique advantage..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Business Registration
          </label>
          <input
            className={inputClass}
            placeholder="BR number"
            value={formData.BR}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, BR: e.target.value }))
            }
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-full gradient-blue text-sm font-semibold glow-blue"
      >
        {submitting ? "Creating..." : "Submit for Review"}
      </motion.button>
    </form>
  );
}

export default StartupOwnerDashboard;
