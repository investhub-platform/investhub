import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import DashboardShell from "../../components/layout/DashboardShell";
import { useAuth } from "../../features/auth/useAuth";
import { motion } from "framer-motion";
import { 
  Download, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCcw, 
  Receipt, 
  Loader, 
  AlertCircle 
} from "lucide-react";

function toCSV(rows) {
  const headers = ["id", "type", "amount", "status", "createdAt", "completedAt", "meta"];
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    const row = [
      r._id || r.id,
      r.type || r.txType,
      (r.amount || r.value) + "",
      r.status || "",
      r.createdAt || "",
      r.completedAt || "",
      JSON.stringify(r.meta || {}),
    ];
    lines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
  });
  return lines.join("\n");
}

// Helper for dynamic transaction icons and colors
const getTxUI = (type) => {
  const t = (type || "").toLowerCase();
  if (t.includes("deposit") || t.includes("refund")) {
    return { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  }
  if (t.includes("withdraw") || t.includes("investment") || t.includes("invest")) {
    return { icon: ArrowUpRight, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  }
  return { icon: RefreshCcw, color: "text-slate-400", bg: "bg-white/5", border: "border-white/10" };
};

const getStatusUI = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "completed") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (s === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (s === "failed") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-white/5 text-slate-400 border-white/10";
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        ...(type !== "all" ? { type } : {}),
        ...(status !== "all" ? { status } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(user?._id || user?.id ? { userId: user?._id || user?.id } : {}),
      };

      const res = await api.get("/v1/wallets/transactions", { params });
      const raw = res?.data?.data ?? res?.data;
      const items = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
      setTransactions(items);
    } catch (e) {
      console.error("Failed to load transactions", e);
      setTransactions([]);
      setError(e?.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, status, type, user?._id, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, type, status, startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const haystack = [
        t.type,
        t.status,
        t.description,
        t.currency,
        t.paymentId,
        t._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, search]);

  const total = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const currentPageItems = filteredTransactions.slice(startIndex, startIndex + limit);

  const exportCSV = () => {
    const csv = toCSV(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-[#0B0D10] border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-500";

  return (
    <DashboardShell contentClassName="max-w-6xl mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Transaction History</h1>
                <p className="text-slate-400 text-sm md:text-base font-medium">Track your deposits, investments, and withdrawals.</p>
              </div>
              <button 
                onClick={exportCSV} 
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-white shadow-lg w-full sm:w-auto"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}

            {/* Control Panel (Filters & Search) */}
            <div className="bg-[#0B0D10]/80 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 mb-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search */}
                <div className="md:col-span-4 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    placeholder="Search ID, type, or status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                {/* Type Filter */}
                <div className="md:col-span-2 relative">
                  <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="all">All Types</option>
                    <option value="Deposit">Deposit</option>
                    <option value="Investment">Investment</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="md:col-span-2 relative">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {/* Date Filters */}
                <div className="md:col-span-2">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} title="Start Date" style={{ colorScheme: "dark" }} />
                </div>
                <div className="md:col-span-2">
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} title="End Date" style={{ colorScheme: "dark" }} />
                </div>

              </div>
            </div>

            {/* Ledger / Transactions List */}
            <div className="bg-[#0B0D10] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <span className="font-medium">Loading ledger...</span>
                </div>
              ) : currentPageItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                  <Receipt className="w-12 h-12 mb-4 opacity-40" />
                  <p className="text-lg font-bold text-white mb-1">No transactions found</p>
                  <p className="text-sm">Try adjusting your filters or date range.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {currentPageItems.map((t, idx) => {
                    const txType = t.type || t.txType || "Unknown";
                    const txUI = getTxUI(txType);
                    const TxIcon = txUI.icon;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={t._id || t.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 hover:bg-white/[0.02] transition-colors gap-4"
                      >
                        {/* Left: Icon & Details */}
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${txUI.bg} ${txUI.border}`}>
                            <TxIcon className={`w-6 h-6 ${txUI.color}`} />
                          </div>
                          <div>
                            <div className="text-base font-bold text-white tracking-wide mb-1">{txType}</div>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                              <span>{t.createdAt ? new Date(t.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}</span>
                              <span className="hidden sm:inline-block w-1 h-1 bg-slate-600 rounded-full" />
                              <span className="font-mono text-slate-400 hidden sm:inline-block">ID: {t._id || t.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Status */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 pl-16 sm:pl-0">
                          <div className="text-lg font-black text-white mb-1">
                            {formatCurrency(t.amount || t.value)}
                          </div>
                          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusUI(t.status || t.state)}`}>
                            {t.status || t.state}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Footer */}
              {!loading && currentPageItems.length > 0 && (
                <div className="p-5 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-medium text-slate-400">
                    Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(startIndex + limit, total)}</span> of <span className="text-white">{total}</span> entries
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-sm font-bold transition-all text-white"
                    >
                      Previous
                    </button>
                    <div className="px-4 py-2 rounded-xl bg-[#1A1D24] border border-white/5 text-sm font-bold text-white">
                      {safePage} <span className="text-slate-500 mx-1">/</span> {totalPages}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 text-sm font-bold transition-all text-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
            </div>
            
    </DashboardShell>
  );
}