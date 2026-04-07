import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import DashboardShell from "../../components/layout/DashboardShell";
import { CreditCard, History, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Wifi } from "lucide-react";
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

// ---------------------------------------------------------
// Helper for Card Number Formatting
// ---------------------------------------------------------
const formatCardNumber = (id) => {
  if (!id) return "•••• •••• •••• ••••";
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").padEnd(16, "0").slice(0, 16).toUpperCase();
  return clean.match(/.{1,4}/g).join(" ");
};

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
    <DashboardShell contentClassName="max-w-6xl mx-auto">
            
            <div className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Virtual Wallet</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Manage your funds and investment capacity.</p>
              </div>
              <Link 
                to="/app/wallet/transactions" 
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold text-slate-300 hover:text-white shadow-lg w-full sm:w-auto"
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              
              {/* ----------------------------------------------------- */}
              {/* REALISTIC E-CREDIT CARD DESIGN                        */}
              {/* ----------------------------------------------------- */}
              <div className="lg:col-span-3 perspective-1000 flex items-center justify-center">
                <motion.div 
                  initial={{ rotateY: -10, rotateX: 10, opacity: 0 }}
                  animate={{ rotateY: 0, rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="w-full max-w-[500px] aspect-[1.586/1] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 group mx-auto lg:mx-0"
                  style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)",
                  }}
                >
                  {/* Subtle Noise Texture Overlay */}
                  <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                  
                  {/* Holographic Shine Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out pointer-events-none" />

                  {/* Top Row: Logo & NFC */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg overflow-hidden">
                        <img src="/favicon.ico" alt="InvestHub" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                      </div>
                       <span className="text-white font-black tracking-widest text-xs sm:text-sm drop-shadow-md">InvestHub</span>
                    </div>
                    <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300/80 rotate-90 drop-shadow-md" />
                  </div>

                  {/* Middle Row: EMV Chip & Balance */}
                  <div className="relative z-10 flex flex-col gap-3 sm:gap-4 my-auto">
                    {/* Vector EMV Chip */}
                    <div className="w-10 h-8 sm:w-12 sm:h-10 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-700/50 flex flex-col justify-between p-1 shadow-inner opacity-90">
                      <div className="w-full h-px bg-yellow-700/30" />
                      <div className="w-full h-px bg-yellow-700/30" />
                      <div className="w-full h-px bg-yellow-700/30" />
                    </div>

                    <div>
                      <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400/80 mb-0.5 sm:mb-1 drop-shadow-sm">Available Capital</div>
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg truncate">
                        {loading ? (
                           <div className="h-8 sm:h-10 w-32 sm:w-48 bg-white/10 animate-pulse rounded-lg" />
                        ) : (
                           formatCurrency(wallet?.balance)
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Card Number & User Info */}
                  <div className="relative z-10 flex items-end justify-between gap-4 mt-2">
                    <div className="font-mono text-xs sm:text-base md:text-lg text-slate-200/90 tracking-widest sm:tracking-[0.15em] drop-shadow-md truncate">
                      {loading ? "•••• •••• •••• ••••" : formatCardNumber(wallet?.id || wallet?._id)}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-slate-400/80 drop-shadow-sm">Virtual</div>
                      <div className="text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow-md">
                        {loading ? "---" : "ACTIVE"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ----------------------------------------------------- */}
              {/* TOP UP ACTION CARD                                    */}
              {/* ----------------------------------------------------- */}
              <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-[#0B0D10] border border-white/5 shadow-2xl flex flex-col justify-between">
                <div>
                   <h2 className="text-xl font-bold text-white mb-2">Deposit Funds</h2>
                   <p className="text-sm text-slate-400 mb-6">Add capital to securely invest in validated startups.</p>
                   
                   <div className="relative mb-6">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                     <input
                       type="number"
                       value={amount}
                       onChange={(e) => setAmount(Number(e.target.value))}
                       className="w-full pl-8 pr-4 py-4 rounded-xl bg-[#1A1D24] border border-white/5 text-white font-bold text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                       min={1}
                     />
                   </div>
                </div>

                <div className="space-y-3 mt-auto">
                   <button
                     onClick={initiateDeposit}
                     disabled={initiating}
                     className="w-full group flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50"
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
            <div className="mt-8 md:mt-10 text-center pb-10">
               <p className="text-[10px] sm:text-xs text-slate-500 font-bold tracking-wide uppercase max-w-xl mx-auto flex items-center justify-center gap-2">
                 <CreditCard className="w-4 h-4 shrink-0" />
                 <span className="truncate">
                   {PAYHERE_USE_SDK
                     ? payhereLoaded
                       ? "Secure payments powered by PayHere SDK"
                       : "Secure payments loading fallback mode"
                     : "Sandbox mode active. Do not use real cards."}
                 </span>
               </p>
            </div>

    </DashboardShell>
  );
}