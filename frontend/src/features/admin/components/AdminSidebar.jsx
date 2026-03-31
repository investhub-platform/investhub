import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck } from "lucide-react";

const links = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="w-72 min-h-screen border-r border-white/10 bg-[#020617]/90 backdrop-blur-xl p-6">
      <div className="mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold tracking-wide">InvestHub</h1>
            <p className="text-slate-400 text-sm">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 border ${
                isActive
                  ? "bg-blue-500/10 border-blue-400/20 text-white shadow-[0_0_18px_rgba(59,130,246,0.15)]"
                  : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}