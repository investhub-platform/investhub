import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1000);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/wallets/me");
      setWallet(res?.data?.data || null);
    } catch (e) {
      console.error("Failed to load wallet", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const initiateDeposit = async () => {
    setMsg("");
    try {
      const r = await api.post("/v1/wallets/deposit/initiate", { amount });
      setMsg("Deposit initiated. Follow payment provider flow.");
      console.log("deposit payload", r?.data?.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to initiate deposit");
    }
  };

  if (loading) return <div className="min-h-[200px] p-6">Loading wallet...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Wallet</h1>

        <div className="obsidian-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Available Balance</div>
              <div className="text-3xl font-bold">{formatCurrency(wallet?.balance)}</div>
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
            />
            <button onClick={initiateDeposit} className="rounded-xl gradient-blue px-4 py-2 text-sm font-semibold">
              Top-up
            </button>
            <Link to="/app/wallet/transactions" className="ml-auto text-sm text-primary hover:underline">
              View Transactions
            </Link>
          </div>
          {msg && <div className="text-sm text-muted-foreground mt-3">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
