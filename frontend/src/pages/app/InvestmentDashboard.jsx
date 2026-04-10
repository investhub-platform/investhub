import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell from "../../components/layout/DashboardShell";
import { useAuth } from "../../features/auth/useAuth";
import api from "../../lib/axios";
import {
  Check,
  X,
  Clock,
  TrendingUp,
  DollarSign,
  Loader,
  Send
} from "lucide-react";

const DEFAULT_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";
const PAYHERE_CHECKOUT_URL_RAW =
  import.meta.env.VITE_PAYHERE_CHECKOUT_URL || DEFAULT_CHECKOUT_URL;
const PAYHERE_CHECKOUT_URL = PAYHERE_CHECKOUT_URL_RAW.replace(/\/+$/, "");

function extractPayload(responseData) {
  if (!responseData) return null;
  if (responseData.data && typeof responseData.data === "object")
    return responseData.data;
  return responseData;
}

function openPayHereFormFallback(payload) {
  const required = [
    "merchant_id",
    "return_url",
    "cancel_url",
    "notify_url",
    "order_id",
    "items",
    "currency",
    "amount",
    "hash"
  ];
  const missing = required.filter((key) => !payload?.[key]);
  if (missing.length)
    throw new Error(
      `Payment payload missing required fields: ${missing.join(", ")}`
    );

  const popup = window.open("", "payhere_checkout", "width=920,height=780");
  if (!popup)
    throw new Error(
      "Popup blocked by browser. Please allow popups and try again."
    );

  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYHERE_CHECKOUT_URL;
  form.target = "payhere_checkout";

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

const formatCurrency = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n === 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

export default function InvestmentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tab selection
  const [activeTab, setActiveTab] = useState("sent"); // "sent" or "received"

  // Investment requests
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  // Payment modal
  const [selectedRequestForPayment, setSelectedRequestForPayment] =
    useState(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [pendingPayHereOrderId, setPendingPayHereOrderId] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  // Decision modal
  // const [selectedRequestForDecision, setSelectedRequestForDecision] =
  //   useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [isDecisionProcessing, setIsDecisionProcessing] = useState(false);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const res = await api.get("/v1/wallets/me");
      const wallet = extractPayload(res?.data);
      const nextBalance = Number(wallet?.balance || 0);
      setWalletBalance(nextBalance);
      return nextBalance;
    } catch (e) {
      console.error("Failed to fetch wallet", e);
      setWalletBalance(0);
      return 0;
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  // Fetch sent requests (investor view)
  const fetchSentRequests = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    setLoading(true);
    setError("");
    try {
      const userId = user?.id || user?._id;
      const res = await api.get(
        `/v1/requests/investor/${userId}?t=${Date.now()}`
      );
      const requests = res?.data?.data || [];
      setSentRequests(requests);
      console.log(
        "Fetched sent requests:",
        requests.map((r) => ({ id: r._id, status: r.requestStatus }))
      );
    } catch (e) {
      setError("Failed to load investment requests");
      console.error("Fetch sent requests error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch received requests (founder view - need to think about this)
  // We need to find requests for ideas created by the founder
  const fetchReceivedRequests = useCallback(async () => {
    if (!user?.id && !user?._id) return;
    setLoading(true);
    setError("");
    try {
      // First get all ideas created by founder
      const userId = user?.id || user?._id;
      const allRequests = await api.get(`/v1/requests?t=${Date.now()}`);

      // Filter for requests where founderId matches current user
      const founderRequests = (allRequests?.data?.data || []).filter(
        (req) =>
          String(req.founderId?.id || req.founderId?._id || req.founderId) ===
          String(userId)
      );

      setReceivedRequests(founderRequests);
      console.log(
        "Fetched received requests:",
        founderRequests.map((r) => ({ id: r._id, status: r.requestStatus }))
      );
    } catch (e) {
      setError("Failed to load received requests");
      console.error("Fetch received requests error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load requests on mount and tab change
  useEffect(() => {
    if (activeTab === "sent") {
      fetchSentRequests();
    } else {
      fetchReceivedRequests();
    }
  }, [activeTab, fetchSentRequests, fetchReceivedRequests]);

  // Handle founder decision (accept/reject)
  const handleFounderDecision = async (requestId, decision) => {
    console.log(
      `Founder decision initiated for request ${requestId} with decision: ${decision}`
    );
    // if (!selectedRequestForDecision) {
    //   console.warn("No request selected for decision");
    //   return;
    // }

    setIsDecisionProcessing(true);
    setError("");
    try {
      const userId = user?.id || user?._id;
      const res = await api.patch(
        `/v1/requests/${requestId}/founder-decision`,
        {
          decision,
          comment: decisionComment || "",
          updatedBy: userId
        }
      );
      console.log("Founder decision API response:", res);
      if (!res?.data) {
        console.warn("Founder decision response missing");
      }

      // Determine new status based on decision
      const newStatus = decision === "accept" ? "pending_mentor" : "rejected";

      // Immediately update local state to show decision
      setReceivedRequests((prevRequests) =>
        prevRequests.map((r) =>
          (r._id || r.id) === requestId
            ? {
                ...r,
                requestStatus: newStatus,
                founderDecision: {
                  decision,
                  comment: decisionComment || "",
                  decidedAt: new Date()
                }
              }
            : r
        )
      );

      setSuccessMessage(
        `Request ${decision === "accept" ? "accepted" : "rejected"} successfully!`
      );
      //setSelectedRequestForDecision(null);
      setDecisionComment("");

      // Refetch to ensure data is in sync with backend
      await new Promise((resolve) => setTimeout(resolve, 300));
      await fetchReceivedRequests();
    } catch (e) {
      const errorMsg =
        e?.response?.data?.message || e?.message || "Failed to update request";
      setError(errorMsg);
      console.error("Founder decision error:", e);
    } finally {
      setIsDecisionProcessing(false);
    }
  };

  // Handle PayHere payment
  const handlePayHerePayment = async (requestId, amount) => {
    setIsPaymentProcessing(true);
    setError("");
    try {
      const request = sentRequests.find((r) => (r._id || r.id) === requestId);
      if (!request) throw new Error("Request not found");

      const startupOwnerId =
        request.founderId?.id || request.founderId?._id || request.founderId;
      const startupId = request.ideaId?.StartupId || request.ideaId?.startupId;
      if (!startupId || !startupOwnerId) {
        throw new Error("Missing startup details required for payment");
      }

      const res = await api.post("/v1/wallets/investment/initiate", {
        amount,
        requestId,
        startupId,
        startupOwnerId
      });
      const payload = extractPayload(res?.data);
      const orderId = payload?.order_id;
      if (!orderId)
        throw new Error("Missing order id from payment initiation response");

      setPendingPayHereOrderId(orderId);
      openPayHereFormFallback(payload);
      setSuccessMessage(
        "Payment popup opened. Complete checkout and then verify status."
      );
      setSelectedRequestForPayment(null);
    } catch (e) {
      setError(e?.response?.data?.message || "PayHere payment failed");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleWalletPayment = async (requestId, amount) => {
    const latestBalance = await fetchWalletBalance();
    if (amount > latestBalance) {
      setError("Insufficient wallet balance. Please top up your wallet.");
      return;
    }

    setIsPaymentProcessing(true);
    setError("");
    try {
      const request = sentRequests.find((r) => (r._id || r.id) === requestId);
      if (!request) throw new Error("Request not found");

      const startupOwnerId =
        request.founderId?.id || request.founderId?._id || request.founderId;
      const startupId = request.ideaId?.StartupId || request.ideaId?.startupId;
      if (!startupId || !startupOwnerId) {
        throw new Error("Missing startup details required for wallet transfer");
      }

      const walletRes = await api.post("/v1/wallets/invest", {
        amount,
        startupOwnerId,
        startupId
      });

      if (!walletRes?.data) {
        throw new Error("Wallet payment failed or no response received");
      }

      const userId = user?.id || user?._id;
      await api.patch(`/v1/requests/${requestId}/status`, {
        requestStatus: "paid",
        updatedBy: userId
      });

      setSuccessMessage("Investment completed successfully using wallet.");
      await fetchWalletBalance();

      setSentRequests((prevRequests) =>
        prevRequests.map((r) =>
          (r._id || r.id) === requestId ? { ...r, requestStatus: "paid" } : r
        )
      );

      setSelectedRequestForPayment(null);
      await fetchSentRequests();
      await fetchReceivedRequests();
    } catch (e) {
      const errorMsg =
        e?.response?.data?.message || e?.message || "Wallet payment failed";
      setError(errorMsg);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const verifyPayHereInvestment = async () => {
    if (!pendingPayHereOrderId) return;
    setError("");
    try {
      const res = await api.get(
        `/v1/wallets/deposit/status/${encodeURIComponent(pendingPayHereOrderId)}`
      );
      const payload = extractPayload(res?.data);
      if (payload?.status === "Completed") {
        setSuccessMessage("Payment confirmed. Investment ledger and status updated.");
        setPendingPayHereOrderId("");
        await fetchSentRequests();
        await fetchReceivedRequests();
      } else if (payload?.status === "Failed") {
        setError("Payment failed or was cancelled.");
        setPendingPayHereOrderId("");
      } else {
        setSuccessMessage("Payment is still processing. Please verify again in a few seconds.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to verify payment status");
    }
  };

  const statusConfig = {
    pending_founder: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      label: "Awaiting Founder Decision"
    },
    pending_mentor: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      label: "Approved - Ready to Pay"
    },
    approved: {
      icon: <Check className="w-4 h-4" />,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      label: "Approved - Ready to Pay"
    },
    paid: {
      icon: <Check className="w-4 h-4" />,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      label: "Invested"
    },
    rejected: {
      icon: <X className="w-4 h-4" />,
      color: "bg-red-500/10 border-red-500/20 text-red-400",
      label: "Rejected"
    }
  };

  const getRequestStatus = (request) => {
    if (request.requestStatus === "paid") return statusConfig.paid;
    if (request.requestStatus === "rejected") return statusConfig.rejected;
    if (
      request.requestStatus === "approved" ||
      request.requestStatus === "pending_mentor"
    ) {
      return statusConfig.approved;
    }
    return statusConfig[request.requestStatus] || statusConfig.pending_founder;
  };

  return (
    <DashboardShell contentClassName="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
                Investment Deals
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Track your investment requests, approvals, and payments
              </p>
            </div>

            {/* Tab Selection */}
            <div className="inline-flex rounded-full p-1.5 bg-[#0B0D10]/80 border border-white/10 backdrop-blur-xl mb-8 shadow-lg">
              {[
                { key: "sent", label: "Investment Requests" },
                { key: "received", label: "Received Requests" }
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="deals-tab"
                        className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] -z-10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span>{successMessage}</span>
                  {pendingPayHereOrderId ? (
                    <button
                      type="button"
                      onClick={verifyPayHereInvestment}
                      className="px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors text-xs font-bold"
                    >
                      Verify PayHere Status
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <span className="font-medium">Loading deals...</span>
                </div>
              ) : activeTab === "sent" ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {sentRequests.length === 0 ? (
                    <div className="text-center py-20 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem]">
                      <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-white mb-2">
                        No Investment Requests
                      </p>
                      <p className="text-sm text-slate-400">
                        Browse ideas and send investment requests from the
                        Explore page
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {sentRequests.map((request) => {
                        const status = getRequestStatus(request);
                        const founderName =
                          request.founderId?.name || "Unknown Founder";
                        const ideaTitle =
                          request.ideaId?.title || "Unknown Idea";
                        const requestTermsText =
                          request.fundingType === "SAFE"
                            ? "via SAFE"
                            : request.proposedPercentage != null
                              ? `for ${request.proposedPercentage}% ${request.fundingType}`
                              : `via ${request.fundingType || "Equity"}`;
                        const canPay =
                          (request.requestStatus === "pending_mentor" ||
                            request.requestStatus === "approved") &&
                          request.requestStatus !== "paid";

                        return (
                          <motion.div
                            key={request._id || request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl hover:border-white/10 transition-colors"
                          >
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {ideaTitle}
                                </h3>
                                <p className="text-sm text-slate-400">
                                  To: {founderName}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-widest w-fit ${status.color}`}
                              >
                                {status.icon}
                                {status.label}
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="p-4 rounded-xl bg-black/20 mb-6">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Investment Amount
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-3xl font-black text-white">
                                  {formatCurrency(request.amount)}
                                </p>
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-200">
                                  {requestTermsText}
                                </span>
                              </div>
                            </div>

                            {/* Message */}
                            {request.message && (
                              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                  Your Message
                                </p>
                                <p className="text-sm text-slate-300">
                                  {request.message}
                                </p>
                              </div>
                            )}

                            {/* Timeline */}
                            <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
                              <span>
                                Sent{" "}
                                {new Date(
                                  request.createdUtc
                                ).toLocaleDateString()}
                              </span>
                              {request.founderDecision?.decidedAt && (
                                <span>
                                  Decision made{" "}
                                  {new Date(
                                    request.founderDecision.decidedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Payment Button */}
                            {canPay && (
                              <button
                                onClick={() =>
                                  (setPaymentMethod("wallet"), setSelectedRequestForPayment(request))
                                }
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                              >
                                Choose Payment Method
                              </button>
                            )}

                            {request.requestStatus === "paid" && (
                              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                ✓ Invested {formatCurrency(request.amount)}{" "}
                                successfully
                              </div>
                            )}

                            {request.requestStatus === "rejected" && (
                              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                ✗ Request rejected by founder
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="received"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {receivedRequests.length === 0 ? (
                    <div className="text-center py-20 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem]">
                      <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-xl font-bold text-white mb-2">
                        No Received Requests
                      </p>
                      <p className="text-sm text-slate-400">
                        Investment requests from interested investors will
                        appear here
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {receivedRequests.map((request) => {
                        const status = getRequestStatus(request);
                        const investorName =
                          request.investorId?.name || "Unknown Investor";
                        const ideaTitle =
                          request.ideaId?.title || "Unknown Idea";
                        const requestTermsText =
                          request.fundingType === "SAFE"
                            ? "via SAFE"
                            : request.proposedPercentage != null
                              ? `for ${request.proposedPercentage}% ${request.fundingType}`
                              : `via ${request.fundingType || "Equity"}`;
                        const canDecide =
                          request.requestStatus === "pending_founder";

                        return (
                          <motion.div
                            key={request._id || request.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl hover:border-white/10 transition-colors"
                          >
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  Investment Request
                                </h3>
                                <p className="text-sm text-slate-400">
                                  From: {investorName}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  For: {ideaTitle}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-widest w-fit ${status.color}`}
                              >
                                {status.icon}
                                {status.label}
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="p-4 rounded-xl bg-black/20 mb-6">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Proposed Investment
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-3xl font-black text-white">
                                  {formatCurrency(request.amount)}
                                </p>
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-200">
                                  {requestTermsText}
                                </span>
                              </div>
                            </div>

                            {/* Message */}
                            {request.message && (
                              <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                  Investor Message
                                </p>
                                <p className="text-sm text-slate-300">
                                  {request.message}
                                </p>
                              </div>
                            )}

                            {/* Decision Section */}
                            {canDecide && (
                              <div className="space-y-4 mb-6">
                                <div>
                                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                                    Decision Comment (Optional)
                                  </label>
                                  <textarea
                                    value={decisionComment}
                                    onChange={(e) =>
                                      setDecisionComment(e.target.value)
                                    }
                                    placeholder="Add a comment for the investor..."
                                    className="w-full px-4 py-3 rounded-xl bg-[#1A1D24] border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-inner resize-none min-h-[80px]"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    onClick={() =>
                                      handleFounderDecision(
                                        request._id || request.id,
                                        "reject"
                                      )
                                    }
                                    disabled={isDecisionProcessing}
                                    className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isDecisionProcessing
                                      ? "Processing..."
                                      : "Reject"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleFounderDecision(
                                        request._id || request.id,
                                        "accept"
                                      )
                                    }
                                    disabled={isDecisionProcessing}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isDecisionProcessing
                                      ? "Processing..."
                                      : "Accept"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Decision Display */}
                            {request.founderDecision?.decidedAt && (
                              <div
                                className={`p-4 rounded-lg border ${
                                  request.founderDecision.decision === "accept"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                                } text-sm font-medium`}
                              >
                                {request.founderDecision.decision === "accept"
                                  ? "✓ Accepted"
                                  : "✗ Rejected"}
                                {request.founderDecision.comment && (
                                  <p className="mt-2 text-xs opacity-80">
                                    {request.founderDecision.comment}
                                  </p>
                                )}
                              </div>
                            )}

                            {request.requestStatus === "paid" && (
                              <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                ✓ Investor has paid{" "}
                                {formatCurrency(request.amount)} for this idea
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {selectedRequestForPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
              onClick={() => setSelectedRequestForPayment(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0B0D10] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white mb-6">
                Payment Method
              </h3>

              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-[#1A1D24] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white">Pay from Wallet</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Wallet balance: {formatCurrency(walletBalance)}
                  </p>
                </button>

                <button
                  onClick={() => setPaymentMethod("payhere")}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "payhere"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-[#1A1D24] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="font-bold text-white">Pay with PayHere Escrow</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Entire amount is collected in merchant escrow first, then platform split is settled.
                  </p>
                </button>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-black/20 mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Amount to Pay
                </p>
                <p className="text-2xl font-black text-white">
                  {formatCurrency(selectedRequestForPayment?.amount)}
                </p>
              </div>

              {paymentMethod === "wallet" &&
                selectedRequestForPayment?.amount > walletBalance && (
                  <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
                    Insufficient wallet balance for this payment. Choose PayHere or top up your wallet.
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRequestForPayment(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (paymentMethod === "wallet") {
                      handleWalletPayment(
                        selectedRequestForPayment._id ||
                          selectedRequestForPayment.id,
                        selectedRequestForPayment.amount
                      );
                    } else {
                      handlePayHerePayment(
                        selectedRequestForPayment._id ||
                          selectedRequestForPayment.id,
                        selectedRequestForPayment.amount
                      );
                    }
                  }}
                  disabled={
                    isPaymentProcessing ||
                    (paymentMethod === "wallet" &&
                      selectedRequestForPayment?.amount > walletBalance)
                  }
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
