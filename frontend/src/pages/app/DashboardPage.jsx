// DashboardPage.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";

export default function DashboardPage() {
  const { user } = useAuth();

  const mockStats = [
    { label: "Total Investments", value: "12" },
    { label: "Active Startups", value: "5" },
    { label: "Unread Notifications", value: "3" },
    { label: "Wallet Balance", value: "$2,450.00" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex"> {/* Updated styling */}
      <DesktopSidebar /> {/* Added sidebar */}
      
      <main className="flex-1 w-full">
        <AppNavbar />

        <div className="pt-28 max-w-5xl mx-auto px-6 py-10 w-full"> {/* Made sure it spans correctly */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl heading-tight">Dashboard</h1> {/* Adjusted typography classes */}
              <p className="text-muted-foreground mt-1">
                Welcome back, {user?.name || "User"}.
              </p>
            </div>

            <Link
              to="/app/profile"
              className="hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition-colors"
            >
              View Profile
            </Link>
          </div>

          {/* Mock Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStats.map((s) => (
              <div
                key={s.label}
                className="obsidian-card p-5" // Updated to use obsidian card design
              >
                <div className="text-sm text-muted-foreground">{s.label}</div>
                <div className="mt-2 text-2xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="obsidian-card p-5"> {/* Updated to use obsidian card design */}
              <div className="text-sm text-muted-foreground">Signed in as</div>
              <div className="mt-2 font-semibold">{user?.email}</div>
              <div className="mt-2 text-sm text-muted-foreground">
                Roles: {(user?.roles || []).join(", ") || "user"}
              </div>
            </div>

            <div className="obsidian-card p-5"> {/* Updated to use obsidian card design */}
              <div className="text-sm text-muted-foreground">Quick links</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  to="/app/profile"
                  className="rounded-xl gradient-blue px-4 py-2 text-sm font-semibold text-white glow-blue transition-all"
                >
                  My Profile
                </Link>

                <Link
                  to="/"
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Back to Landing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}