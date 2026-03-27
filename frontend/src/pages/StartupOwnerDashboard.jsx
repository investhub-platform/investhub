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
  const [activeView, setActiveView] = useState("manage");
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

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
      setStartups(data.map(normalizeStartup));
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to load startups.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 px-4 md:px-8 pt-28 pb-12 max-w-7xl">
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
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function StartupManageCard({ startup, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: startup.name,
    description: startup.description,
    BR: startup.BR,
    status: startup.status
  });

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
    (r) => r.status === "pending"
  ).length;

  useEffect(() => {
    setFormData({
      name: startup.name,
      description: startup.description,
      BR: startup.BR,
      status: startup.status
    });
  }, [startup]);

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
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
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
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] focus:outline-none focus:ring-primary/50 text-sm"
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
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] focus:outline-none focus:ring-primary/50 text-sm"
                        value={formData.BR}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            BR: e.target.value
                          }))
                        }
                        placeholder="Business Registration"
                      />
                      <select
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] focus:outline-none focus:ring-primary/50 text-sm"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value
                          }))
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="NotApproved">Not Approved</option>
                      </select>
                    </div>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] focus:outline-none focus:ring-primary/50 text-sm"
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
                      <InvestorRequestCard key={req.id} request={req} />
                    ))}
                  </div>
                </div>
              )}

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
    <div className="p-3 rounded-2xl bg-white/[0.03] text-center">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function InvestorRequestCard({ request }) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    accepted: <CheckCircle2 className="w-4 h-4 text-accent" />,
    declined: <XCircle className="w-4 h-4 text-destructive" />
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold shrink-0">
          {request.investorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{request.investorName}</p>
            <div className="flex items-center gap-1.5">
              {statusIcons[request.status]}
              <span className="text-xs text-muted-foreground capitalize">
                {request.status}
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold text-primary mt-0.5">
            {formatCurrency(request.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {request.message}
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5">
            {request.date}
          </p>

          {request.status === "pending" && (
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 rounded-full gradient-blue text-xs font-semibold">
                Accept
              </button>
              <button className="flex-1 py-1.5 rounded-full bg-white/5 border border-white/[0.07] text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Decline
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
  const { user } = useAuth();

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
      const normalizedStatus =
        formData.status === "approved"
          ? "Approved"
          : formData.status === "notapproved"
            ? "NotApproved"
            : "pending";

      const res = await api.post("/v1/startups", {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        BR: formData.BR.trim() || null,
        status: normalizedStatus,
        userID: user?.id || user?._id
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
          className={`${inputClass} min-h-[100px] resize-none`}
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
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">
            Status
          </label>
          <select
            className={inputClass}
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="NotApproved">NotApproved</option>
          </select>
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
