import AdminStatCard from "../components/AdminStatCard";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 mt-2">
          Welcome to the InvestHub admin dashboard.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <AdminStatCard title="Total Users" value="--" subtitle="Connect stats API later" />
        <AdminStatCard title="Active Users" value="--" subtitle="Connect stats API later" />
        <AdminStatCard title="Suspended Users" value="--" subtitle="Connect stats API later" />
        <AdminStatCard title="Admins" value="--" subtitle="Connect stats API later" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-3">Next Admin Features</h2>
        <div className="text-slate-300 space-y-2">
          <p>• User management</p>
          <p>• Role updates</p>
          <p>• Account suspension and deletion</p>
          <p>• Platform analytics</p>
        </div>
      </section>
    </div>
  );
}