export default function StartupTable({
  startups = [],
  onApprove,
  onReject,
}) {
  if (!startups.length) {
    return (
      <div className="p-6 text-slate-400">
        No startups found.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-slate-300">
          <tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Description</th>
            <th className="px-6 py-4 text-left">BR</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {startups.map((s) => (
            <tr key={s._id} className="border-t border-white/10">
              <td className="px-6 py-4 text-white">{s.name}</td>
              <td className="px-6 py-4 text-slate-300">
                {s.description || "-"}
              </td>
              <td className="px-6 py-4 text-slate-400">
                {s.BR || "-"}
              </td>

              <td className="px-6 py-4">
                <span className="text-yellow-300">
                  {s.status}
                </span>
              </td>

              <td className="px-6 py-4 flex gap-2">
                <button
                  onClick={() => onApprove(s._id)}
                  className="px-3 py-2 rounded-xl bg-green-500/20 text-green-300"
                >
                  Approve
                </button>

                <button
                  onClick={() => onReject(s._id)}
                  className="px-3 py-2 rounded-xl bg-red-500/20 text-red-300"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}