import { useState } from "react";
import {
  Compass,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  TrendingUp,
  Wallet,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { icon: Compass, label: "Explore", path: "/app/explore" },
  { icon: Briefcase, label: "Portfolio", path: "/app/portfolio" },
  { icon: MessageSquare, label: "Messages", path: "/app/messages" },
  { icon: Wallet, label: "Wallet", path: "/app/wallet" },
  { icon: BarChart3, label: "Mentor Hub", path: "/app/mentor" },
  { icon: TrendingUp, label: "Founder Hub", path: "/app/founder" },
  { icon: List, label: "Transactions", path: "/app/wallet/transactions" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

function getActivePath(pathname, items) {
  const match = items
    .filter((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.path || "";
}

export function DesktopSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true); // Default collapsed for modern look
  const activePath = getActivePath(location.pathname, sidebarItems);

  return (
    <aside
      className={`hidden lg:flex relative flex-col h-screen sticky top-0 bg-[#06080D]/80 backdrop-blur-2xl border-r border-white/5 py-6 transition-all duration-300 z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-8 -right-3 p-1.5 rounded-full bg-[#1A1D24] border border-white/10 text-slate-400 hover:text-white transition-colors z-[60] shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand area (optional depending on Navbar) */}
      <div className={`flex items-center justify-center mb-10 ${collapsed ? 'px-0' : 'px-6 justify-start'}`}>
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         </div>
         {!collapsed && <span className="ml-3 text-white font-bold tracking-wide text-lg">InvestHub</span>}
      </div>

      <div className="flex flex-col gap-2 flex-1 px-3">
        {sidebarItems.map((item) => {
          const active = activePath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-3 rounded-xl text-sm font-medium transition-all outline-none group ${
                active
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center px-0" : "gap-4 px-4"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 transition-transform ${!active && 'group-hover:scale-110'}`} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {!collapsed && (
        <div className="mx-4 mt-auto p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 blur-[30px] rounded-full pointer-events-none" />
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Wallet Balance</p>
          <p className="text-2xl font-bold text-white">$14,500</p>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-2 bg-emerald-500/10 w-fit px-2 py-1 rounded-md border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" /> +12.4%
          </div>
        </div>
      )}
    </aside>
  );
}