import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";

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
  const required = [
    "merchant_id",
    "return_url",
    "cancel_url",
    "notify_url",
    "order_id",
    "items",
    "currency",
    "amount",
    "hash",
  ];

  const missing = required.filter((key) => !payload?.[key]);
  if (missing.length) {
    throw new Error(`Payment payload missing required fields: ${missing.join(", ")}`);
  }

  const popup = window.open("", "payhere_checkout", "width=920,height=780");
  if (!popup) {
    throw new Error("Popup blocked by browser. Please allow popups and try again.");
  }

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
  if (err?.response?.status === 401) {
    return "Session expired or unauthorized. Please login again and retry.";
  }
  return err?.response?.data?.message || err?.message || fallback;
}

function loadPayHereScript() {
  return new Promise((resolve, reject) => {
    if (window.payhere) {
      resolve(window.payhere);
      return;
    }

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
      await api.post("/v1/wallets/deposit/fail", {
        orderId,
        reason,
      });
    } catch (err) {
      console.error("Failed to mark deposit as failed", err);
      if (err?.response?.status === 401) {
        setError("Session expired while updating payment status. Please login again.");
      }
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
        console.error("Failed to fetch deposit status", err);
        if (err?.response?.status === 401) {
          setError("Session expired while checking payment status. Please login again.");
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
      // Ignore in production/public flows where this fallback is disabled.
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
      console.error("Failed to load wallet", e);
      setError(getApiErrorMessage(e, "Failed to load wallet"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!PAYHERE_USE_SDK) return;

    let mounted = true;
    loadPayHereScript()
      .then(() => {
        if (mounted) setPayhereLoaded(true);
      })
      .catch((err) => {
        console.warn("PayHere SDK unavailable, fallback form submit will be used.", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const initiateDeposit = async () => {
    setMsg("");
    setError("");
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setInitiating(true);
    try {
      const r = await api.post("/v1/wallets/deposit/initiate", {
        amount,
        ...(PAYHERE_FRONTEND_URL_OVERRIDE
          ? { frontendUrl: PAYHERE_FRONTEND_URL_OVERRIDE }
          : {}),
        ...(PAYHERE_BACKEND_URL_OVERRIDE
          ? { backendUrl: PAYHERE_BACKEND_URL_OVERRIDE }
          : {}),
      });
      const payload = extractPayload(r?.data);
      const orderId = payload?.order_id;
      setPendingOrderId(orderId || "");

      if (PAYHERE_USE_SDK && window.payhere) {
        const sdkPayment = {
          ...payload,
          // PayHere SDK expects explicit sandbox mode for sandbox merchant flows.
          sandbox: true,
          // For SDK popup mode, PayHere recommends leaving these undefined.
          return_url: undefined,
          cancel_url: undefined,
        };

        window.payhere.onCompleted = async function onCompleted(completedOrderId) {
          const resolvedOrderId = completedOrderId || orderId;
          await confirmDepositFromClient(resolvedOrderId);
          setMsg("Payment completed. Verifying with gateway...");
          setError("");
          await pollDepositStatus(resolvedOrderId);
        };

        window.payhere.onDismissed = async function onDismissed() {
          const failedOrderId = orderId;
          await markDepositFailed(failedOrderId, "Payment popup dismissed by user");
          setError("Payment was cancelled before completion.");
        };

        window.payhere.onError = async function onError(errorText) {
          const failedOrderId = orderId;
          await markDepositFailed(failedOrderId, `Payment popup error: ${errorText || "Unknown error"}`);
          setError(`Payment failed: ${errorText || "Unknown error"}`);
        };

        window.payhere.startPayment(sdkPayment);
      } else {
        openPayHereFormFallback(payload);
      }

      setMsg("Payment popup opened. Complete payment to finalize top-up.");
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Failed to initiate deposit"));
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DesktopSidebar />
      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-10 w-full">
          <h1 className="text-2xl font-semibold mb-4">Wallet</h1>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {msg && (
            <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
              {msg}
            </div>
          )}

          <div className="obsidian-card p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-3xl font-bold">
                  {loading ? "Loading..." : formatCurrency(wallet?.balance)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Wallet ID</div>
                <div className="text-sm">{wallet?.id || wallet?._id}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Top-up</h2>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                min={1}
              />
              <button
                onClick={initiateDeposit}
                disabled={initiating}
                className="rounded-xl gradient-blue px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {initiating ? "Opening..." : "Top-up"}
              </button>
              {pendingOrderId && (
                <button
                  onClick={() => pollDepositStatus(pendingOrderId)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm"
                >
                  Check Status
                </button>
              )}
              <Link to="/app/wallet/transactions" className="ml-auto text-sm text-primary hover:underline">
                View Transactions
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {PAYHERE_USE_SDK
                ? payhereLoaded
                  ? "PayHere SDK mode enabled."
                  : "PayHere SDK requested but not loaded. Form popup fallback will be used."
                : "PayHere form-popup mode enabled (recommended for local sandbox to avoid browser CORS issues)."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
