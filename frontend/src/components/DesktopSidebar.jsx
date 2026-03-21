// DesktopSidebar.jsx
import { useState } from "react";
import {
  Compass,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { icon: Compass, label: "Explore", path: "/app/explore" },
  { icon: Briefcase, label: "Portfolio", path: "/app/portfolio" },
  { icon: MessageSquare, label: "Messages", path: "/app/messages" },
  { icon: BarChart3, label: "Mentor Hub", path: "/app/mentor" },
  { icon: TrendingUp, label: "Founder Hub", path: "/app/founder" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

export function DesktopSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // normalize by comparing the main app segment (e.g. '/app/mentor' -> 'mentor')
  const currentSegment = location.pathname.split("/")[2] || "";

  return (
    <aside
      className={`hidden lg:flex relative flex-col min-h-screen bg-card/50 border-r border-white/[0.07] p-4 pt-24 transition-all duration-200 ${
        collapsed ? "w-20" : "w-60"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute top-24 right-0 translate-x-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors z-[60]"
        aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
        title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex flex-col gap-1 flex-1">
        {sidebarItems.map((item) => {
          const itemSegment = item.path.split("/")[2] || "";
          const active = currentSegment === itemSegment || location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-all outline-none ${
                active
                  ? "sidebar-item-active"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : "gap-3 px-3"}`}
              aria-current={active ? "page" : undefined}
              title={item.label}
            >
              <item.icon className="w-4 h-4" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>

      {!collapsed && (
        <div className="glass-card p-4 mt-4">
          <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
          <p className="text-lg font-semibold">$14,500</p>
          <p className="text-xs text-accent mt-1">+12.4% this month</p>
        </div>
      )}
    </aside>
  );
}