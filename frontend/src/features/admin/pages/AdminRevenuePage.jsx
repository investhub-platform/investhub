import { useEffect, useMemo, useState } from "react";
import { RefreshCw, DollarSign, Wallet, Percent, ReceiptText } from "lucide-react";
import AdminStatCard from "../components/AdminStatCard";
import { getPlatformIncome } from "../api/adminApi";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "-";
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminRevenuePage() {
  const [incomeData, setIncomeData] = useState({
    adminWalletBalance: 0,
    totalIncome: 0,
    feePercent: 5,
    transactionCount: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchRevenueData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const incomeRes = await getPlatformIncome();
      const incomePayload = incomeRes?.data || {};

      setIncomeData({
        adminWalletBalance: Number(incomePayload?.adminWalletBalance || 0),
        totalIncome: Number(incomePayload?.totalIncome || 0),
        feePercent: Number(incomePayload?.feePercent || 5),
        transactionCount: Number(incomePayload?.transactionCount || 0),
        transactions: Array.isArray(incomePayload?.transactions)
          ? incomePayload.transactions
          : [],
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load revenue data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const recentFeeTransactions = useMemo(() => {
    return [...(incomeData.transactions || [])];
  }, [incomeData.transactions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue</h1>
          <p className="text-slate-400 mt-2">Loading revenue data...</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue</h1>
          <p className="text-slate-400 mt-2">Platform income details</p>
        </div>
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#020617] p-7 shadow-[0_0_30px_rgba(15,23,42,0.35)]">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-0 w-56 h-56 bg-cyan-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
              Revenue Management
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Platform Revenue Overview
            </h1>
            <p className="text-slate-400 mt-3 max-w-2xl">
              Track platform fee earnings, wallet balance, and revenue transactions.
            </p>
          </div>

          <button
            onClick={() => fetchRevenueData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Revenue"
          value={formatCurrency(incomeData.totalIncome)}
          subtitle="Total platform fee income"
          accent="blue"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Admin Wallet"
          value={formatCurrency(incomeData.adminWalletBalance)}
          subtitle="Current platform wallet balance"
          accent="purple"
          icon={<Wallet className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Fee Percent"
          value={`${incomeData.feePercent}%`}
          subtitle="Current platform fee rate"
          accent="amber"
          icon={<Percent className="w-5 h-5" />}
        />
        <AdminStatCard
          title="Transactions"
          value={incomeData.transactionCount}
          subtitle="Completed fee transactions"
          accent="green"
          icon={<ReceiptText className="w-5 h-5" />}
        />
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Platform Fee Transactions
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Full list of service fee income collected by the platform
            </p>
          </div>
        </div>

        {recentFeeTransactions.length === 0 ? (
          <div className="text-slate-400">No platform fee transactions available yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="text-slate-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 pr-4">Description</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Startup</th>
                  <th className="text-left py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentFeeTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-white/5">
                    <td className="py-4 pr-4 text-white font-medium">
                      {tx.description || "Platform fee collected"}
                    </td>
                    <td className="py-4 pr-4 text-cyan-300 font-semibold">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-300">
                      {tx.relatedStartupId || "-"}
                    </td>
                    <td className="py-4 text-slate-400">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}