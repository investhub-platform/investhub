import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import { CreditCard, History, Wallet as WalletIcon, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const DEFAULT_CHECKOUT_URL = "https://sandbox.payhere.lk/pay/checkout";
const PAYHERE_CHECKOUT_URL_RAW = import.meta.env.VITE_PAYHERE_CHECKOUT_URL || DEFAULT_CHECKOUT_URL;
const PAYHERE_CHECKOUT_URL = PAYHERE_CHECKOUT_URL_RAW.replace(/\/+$/, "");
const PAYHERE_USE_SDK = import.meta.env.VITE_PAYHERE_USE_SDK === "true";
const PAYHERE_FRONTEND_URL_OVERRIDE = import.meta.env.VITE_PAYHERE_FRONTEND_URL_OVERRIDE;
const PAYHERE_BACKEND_URL_OVERRIDE = import.meta.env.VITE_PAYHERE_BACKEND_URL_OVERRIDE;

function extractPayload(responseData) {
  if (!responseData) return null;
  if (responseData.data && typeof responseData.data === "object") return responseData.data;
  return responseData;
}

function openPayHereFormFallback(payload) {
  const required = ["merchant_id", "return_url", "cancel_url", "notify_url", "order_id", "items", "currency", "amount", "hash"];
  const missing = required.filter((key) => !payload?.[key]);
  if (missing.length) throw new Error(`Payment payload missing required fields: ${missing.join(", ")}`);

  const popup = window.open("", "payhere_checkout", "width=920,height=780");
  if (!popup) throw new Error("Popup blocked by browser. Please allow popups and try again.");

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

function getApiErrorMessage(err, fallback) {
  if (err?.response?.status === 401) return "Session expired or unauthorized. Please login again and retry.";
  return err?.response?.data?.message || err?.message || fallback;
}

function loadPayHereScript() {
  return new Promise((resolve, reject) => {
    if (window.payhere) return resolve(window.payhere);
    const existing = document.querySelector('script[data-payhere="checkout"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.payhere));
      existing.addEventListener("error", () => reject(new Error("Failed to load PayHere SDK")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.dataset.payhere = "checkout";
    script.onload = () => resolve(window.payhere);
    script.onerror = () => reject(new Error("Failed to load PayHere SDK"));
    document.body.appendChild(script);
  });
}

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [initiating, setInitiating] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");
  const [payhereLoaded, setPayhereLoaded] = useState(false);

  const markDepositFailed = async (orderId, reason) => {
    if (!orderId) return;
    try {
      await api.post("/v1/wallets/deposit/fail", { orderId, reason });
    } catch (err) {
      if (err?.response?.status === 401) setError("Session expired while updating payment status. Please login again.");
    }
  };

  const pollDepositStatus = async (orderId) => {
    const maxAttempts = 10;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const res = await api.get(`/v1/wallets/deposit/status/${encodeURIComponent(orderId)}`);
        const statusPayload = extractPayload(res?.data) || res?.data;
        const status = statusPayload?.status;

        if (status === "Completed") {
          setMsg("Top-up completed successfully and wallet has been updated.");
          await load();
          setPendingOrderId("");
          return;
        }

        if (status === "Failed") {
          setError("Payment was not completed. Please try again.");
          setPendingOrderId("");
          return;
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          setError("Session expired while checking payment status.");
          setPendingOrderId("");
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    setMsg("Payment is still processing. Please check transaction history in a few moments.");
  };

  const confirmDepositFromClient = async (orderId) => {
    if (!orderId) return;
    try {
      await api.post("/v1/wallets/deposit/confirm-client", { orderId });
    } catch (err) {
      console.warn("Client confirmation fallback not applied", err?.response?.status || err?.message);
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/v1/wallets/me");
      const data = extractPayload(res?.data);
      setWallet(data || null);
    } catch (e) {
      setError(getApiErrorMessage(e, "Failed to load wallet"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!PAYHERE_USE_SDK) return;
    let mounted = true;
    loadPayHereScript()
      .then(() => { if (mounted) setPayhereLoaded(true); })
      .catch((err) => console.warn("PayHere SDK unavailable, fallback form submit will be used.", err));
    return () => { mounted = false; };
  }, []);

  const initiateDeposit = async () => {
    setMsg(""); setError("");
    if (!amount || Number(amount) <= 0) return setError("Please enter a valid amount.");
    
    setInitiating(true);
    try {
      const r = await api.post("/v1/wallets/deposit/initiate", {
        amount,
        ...(PAYHERE_FRONTEND_URL_OVERRIDE ? { frontendUrl: PAYHERE_FRONTEND_URL_OVERRIDE } : {}),
        ...(PAYHERE_BACKEND_URL_OVERRIDE ? { backendUrl: PAYHERE_BACKEND_URL_OVERRIDE } : {}),
      });
      const payload = extractPayload(r?.data);
      const orderId = payload?.order_id;
      setPendingOrderId(orderId || "");

      if (PAYHERE_USE_SDK && window.payhere) {
        const sdkPayment = { ...payload, sandbox: true, return_url: undefined, cancel_url: undefined };
        window.payhere.onCompleted = async function onCompleted(completedOrderId) {
          const resolvedOrderId = completedOrderId || orderId;
          await confirmDepositFromClient(resolvedOrderId);
          setMsg("Payment completed. Verifying with gateway...");
          setError("");
          await pollDepositStatus(resolvedOrderId);
        };
        window.payhere.onDismissed = async function onDismissed() {
          await markDepositFailed(orderId, "Payment popup dismissed by user");
          setError("Payment was cancelled before completion.");
        };
        window.payhere.onError = async function onError(errorText) {
          await markDepositFailed(orderId, `Payment popup error: ${errorText || "Unknown error"}`);
          setError(`Payment failed: ${errorText || "Unknown error"}`);
        };
        window.payhere.startPayment(sdkPayment);
      } else {
        openPayHereFormFallback(payload);
      }
      setMsg("Payment popup opened. Complete payment to finalize top-up.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to initiate deposit"));
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Fixed Top Navbar */}
      <AppNavbar />

      {/* Main App Shell */}
      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* Sticky Sidebar */}
        <DesktopSidebar />

        {/* Scrollable Content Area */}
        <main className="flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Virtual Wallet</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Manage your funds and investment capacity.</p>
              </div>
              <Link 
                to="/app/wallet/transactions" 
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white"
              >
                <History className="w-4 h-4" /> View Transactions
              </Link>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}
            {msg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {msg}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Balance Card */}
              <div className="md:col-span-3 p-8 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-[#0B0D10] border border-blue-500/30 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <WalletIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider text-blue-400">Available Balance</span>
                </div>
                
                <div className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2">
                  {loading ? (
                     <div className="h-14 w-48 bg-white/10 animate-pulse rounded-lg" />
                  ) : (
                     formatCurrency(wallet?.balance)
                  )}
                </div>
                
                <div className="text-xs font-medium text-slate-400 mt-6 flex items-center gap-2">
                  Wallet ID: <span className="font-mono bg-black/40 px-2 py-1 rounded text-slate-300">{wallet?.id || wallet?._id || "Loading..."}</span>
                </div>
              </div>

              {/* Top Up Card */}
              <div className="md:col-span-2 p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl flex flex-col justify-between">
                <div>
                   <h2 className="text-xl font-bold text-white mb-2">Top-up Wallet</h2>
                   <p className="text-sm text-slate-400 mb-6">Add funds to securely invest in validated startups.</p>
                   
                   <div className="relative mb-6">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                     <input
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(Number(e.target.value))}
                       className="w-full pl-8 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                       min={1}
                     />
                   </div>
                </div>

                <div className="space-y-3">
                   <button
                     onClick={initiateDeposit}
                     disabled={initiating}
                     className="w-full group flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                   >
                     {initiating ? "Processing..." : "Continue to Payment"}
                     {!initiating && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                   </button>
                   
                   {pendingOrderId && (
                     <button
                       onClick={() => pollDepositStatus(pendingOrderId)}
                       className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                     >
                       <RefreshCw className="w-4 h-4" /> Verify Status
                     </button>
                   )}
                </div>
              </div>

            </div>

            {/* Helper Text */}
            <div className="mt-8 text-center">
               <p className="text-xs text-slate-500 font-medium max-w-xl mx-auto flex items-center justify-center gap-2">
                 <CreditCard className="w-4 h-4" />
                 {PAYHERE_USE_SDK
                   ? payhereLoaded
                     ? "Secure payments powered by PayHere SDK."
                     : "Secure payments loading fallback mode."
                   : "PayHere sandbox mode active. Do not use real card details."}
               </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}