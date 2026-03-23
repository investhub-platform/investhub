import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { formatCurrency } from "@/data/mockData";

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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/v1/wallets/transactions", { params: { page, limit, q: filter } });
      const data = res?.data?.data || {};
      setTransactions(data.items || data || []);
      setTotal(data.total || (data.items ? data.items.length : transactions.length));
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const exportCSV = () => {
    const csv = toCSV(transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Transaction History</h1>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            />
            <button onClick={exportCSV} className="text-sm text-primary hover:underline">
              Export CSV
            </button>
          </div>
        </div>

        <div className="obsidian-card p-4">
          {loading ? (
            <div>Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No transactions found.</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div key={t._id || t.id} className="flex justify-between items-center p-3 bg-white/2 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{t.type || t.txType}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
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
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded-xl bg-white/5">
              Prev
            </button>
            <div className="px-3">{page}</div>
            <button onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-xl bg-white/5">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
