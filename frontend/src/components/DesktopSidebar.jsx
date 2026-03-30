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
  const [collapsed, setCollapsed] = useState(false); // Default OPEN so users can read text
  const activePath = getActivePath(location.pathname, sidebarItems);

  return (
    <aside
      className={`hidden lg:flex relative flex-col sticky top-20 h-[calc(100vh-5rem)] bg-[#020617]/50 backdrop-blur-xl border-r border-white/5 pt-8 pb-6 transition-all duration-300 ease-in-out z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Minimize/Expand Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-6 -right-3.5 p-1.5 rounded-full bg-[#1A1D24] border border-white/10 text-slate-400 hover:text-white transition-colors z-[60] shadow-lg hover:scale-110"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex flex-col gap-2 flex-1 px-3">
        {sidebarItems.map((item) => {
          const active = activePath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center py-3.5 rounded-xl text-sm font-semibold transition-all outline-none group ${
                active
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center px-0" : "px-4 gap-4"}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} />
              
              {!collapsed && (
                <span className="whitespace-nowrap truncate">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-[calc(100%+12px)] px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl z-50 pointer-events-none before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-4 before:border-transparent before:border-r-white">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Wallet Widget */}
      {!collapsed && (
        <div className="mx-4 mt-auto p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-[40px] rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1 font-bold">Wallet Balance</p>
          <p className="text-2xl font-black text-white">$14,500</p>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold mt-2 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-md border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4%
          </div>
        </div>
      )}
    </aside>
  );
}