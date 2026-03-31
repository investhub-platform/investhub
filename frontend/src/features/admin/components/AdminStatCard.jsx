export default function AdminStatCard({
  title,
  value,
  subtitle,
  accent = "blue",
  icon = null,
}) {
  const accentClasses = {
    blue: "from-blue-500/20 to-cyan-500/10 border-blue-400/20",
    green: "from-emerald-500/20 to-green-500/10 border-emerald-400/20",
    amber: "from-amber-500/20 to-yellow-500/10 border-amber-400/20",
    red: "from-red-500/20 to-rose-500/10 border-red-400/20",
    purple: "from-violet-500/20 to-fuchsia-500/10 border-violet-400/20",
  };

  return (
    <div
      className={`rounded-[2rem] border bg-gradient-to-br ${accentClasses[accent]} backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.25)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-300 text-sm">{title}</p>
          <h3 className="text-white text-3xl font-bold mt-3">{value}</h3>
          {subtitle ? <p className="text-slate-400 text-xs mt-2">{subtitle}</p> : null}
        </div>

        {icon ? (
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}