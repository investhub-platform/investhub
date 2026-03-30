import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X, Bell, Settings } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import NotificationDropdown from "../../features/notifications/NotificationDropdown";

const navLinks = [
  { label: "Explore", path: "/app/explore" },
  { label: "Portfolio", path: "/app/portfolio" },
  { label: "Wallet", path: "/app/wallet" },
  { label: "Messages", path: "/app/messages" },
];

function getActivePath(pathname, links) {
  const match = links
    .filter((link) => pathname === link.path || pathname.startsWith(`${link.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.path || "";
}

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const activePath = getActivePath(location.pathname, navLinks);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef(null);

  const initials =
    (user?.name || "User")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "U";

  const onLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    nav("/auth/login", { replace: true });
  };

  // close menus on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!headerRef.current) return;
      if (!headerRef.current.contains(e.target)) {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 w-full px-4 pt-3 pointer-events-none"
    >
      <div className="pointer-events-auto relative flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg w-full">
        {/* Logo */}
        <Link to="/app/explore" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="InvestHub"
            width={28}
            height={28}
            className="h-6 w-6 md:h-7 md:w-7 rounded-md object-contain"
          />
          <span className="text-white font-semibold tracking-wide text-sm md:text-base">
            InvestHub
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="flex-1 justify-center hidden md:flex">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activePath === link.path
                    ? "gradient-blue text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right side */}
         <div className="ml-auto flex items-center gap-2">
          { /*
          <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button> */}

        {/* Notification dropdown */}
        
          <NotificationDropdown />

          {/* Mobile menu button */}
          <button
            onClick={() => {
              setMobileOpen((s) => !s);
              setProfileOpen(false);
            }}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5 text-slate-200" /> : <Menu className="w-5 h-5 text-slate-200" />}
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((s) => !s);
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 transition"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 grid place-items-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold max-w-[140px] truncate text-slate-200">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary/90">
                  {user?.roles?.[0] || "USER"}
                </span>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0B0D10]/95 backdrop-blur p-2 shadow-xl">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/5"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/5"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-200 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="absolute top-[64px] left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-2xl border border-white/10 bg-[#0B0D10]/95 backdrop-blur p-3 shadow-xl md:hidden">
            <nav className="flex flex-col gap-2 text-sm text-slate-200">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activePath === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/app/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/5"
              >
                Profile
              </Link>
              <Link
                to="/app/settings"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/5"
              >
                Settings
              </Link>

              <div className="h-px bg-white/10 my-1" />

              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-red-200 hover:bg-red-500/10"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}