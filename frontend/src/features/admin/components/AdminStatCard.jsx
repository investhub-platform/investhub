export default function AdminStatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_20px_rgba(15,23,42,0.3)]">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-white text-3xl font-bold mt-3">{value}</h3>
      {subtitle ? <p className="text-slate-500 text-xs mt-2">{subtitle}</p> : null}
    </div>
  );
}