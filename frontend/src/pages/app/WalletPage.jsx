import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";

const PAYHERE_CHECKOUT_URL =
  import.meta.env.VITE_PAYHERE_CHECKOUT_URL || "https://sandbox.payhere.lk/pay/checkout";

function extractPayload(responseData) {
  if (!responseData) return null;
  if (responseData.data && typeof responseData.data === "object") return responseData.data;
  return responseData;
}

function openPayHerePopup(payload) {
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

  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYHERE_CHECKOUT_URL;
  form.target = "_blank";

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

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [initiating, setInitiating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/v1/wallets/me");
      const data = extractPayload(res?.data);
      setWallet(data || null);
    } catch (e) {
      console.error("Failed to load wallet", e);
      setError(e?.response?.data?.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
      const r = await api.post("/v1/wallets/deposit/initiate", { amount });
      const payload = extractPayload(r?.data);
      openPayHerePopup(payload);
      setMsg("Payment popup opened. Complete payment to finalize top-up.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to initiate deposit");
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
              <Link to="/app/wallet/transactions" className="ml-auto text-sm text-primary hover:underline">
                View Transactions
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
