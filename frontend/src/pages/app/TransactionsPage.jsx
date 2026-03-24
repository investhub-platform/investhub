import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";
import { useAuth } from "../../features/auth/useAuth";

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

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DesktopSidebar />
      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-10 w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Transaction History</h1>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
              />
              <button onClick={exportCSV} className="text-sm text-primary hover:underline">
                Export CSV
              </button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              <option value="all">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Investment">Investment</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Refund">Refund</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="obsidian-card p-4">
            {loading ? (
              <div>Loading...</div>
            ) : currentPageItems.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No transactions found.</div>
            ) : (
              <div className="space-y-3">
                {currentPageItems.map((t) => (
                  <div key={t._id || t.id} className="flex justify-between items-center p-3 bg-white/2 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{t.type || t.txType}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(t.amount || t.value)}</div>
                      <div className="text-xs text-muted-foreground">{t.status || t.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Total: {total}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="px-3 py-1 rounded-xl bg-white/5 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="px-3">
                {safePage} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="px-3 py-1 rounded-xl bg-white/5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
