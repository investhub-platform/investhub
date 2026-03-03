// DesktopSidebar.jsx
import { Compass, Briefcase, MessageSquare, BarChart3, Settings, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { icon: Compass, label: "Explore", path: "/" },
  { icon: Briefcase, label: "Portfolio", path: "/portfolio" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: BarChart3, label: "Mentor Hub", path: "/mentor" },
  { icon: TrendingUp, label: "Founder Hub", path: "/founder" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function DesktopSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-5rem)] bg-card/50 border-r border-white/[0.07] p-4">
      <div className="flex flex-col gap-1 flex-1">
        {sidebarItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="glass-card p-4 mt-4">
        <p className="text-xs text-muted-foreground mb-1">Wallet Balance</p>
        <p className="text-lg font-semibold">$14,500</p>
        <p className="text-xs text-accent mt-1">+12.4% this month</p>
      </div>
    </aside>
  );
}