import { useEffect, useState } from "react";
import {
  getPendingStartups,
  approveStartup,
  rejectStartup,
} from "../api/startupAdminApi";

import StartupTable from "../components/StartupTable";

export default function AdminStartupsPage() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getPendingStartups();
      setStartups(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    await approveStartup(id);
    fetchData(); // refresh
  };

  const handleReject = async (id) => {
    await rejectStartup(id);
    fetchData(); // refresh
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        Startup Approvals
      </h1>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <StartupTable
          startups={startups}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}