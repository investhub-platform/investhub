import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X, Settings, Crown } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import NotificationDropdown from "../../features/notifications/NotificationDropdown";

const navLinks = [
  { label: "Explore", path: "/app/explore" },
  { label: "Portfolio", path: "/app/portfolio" },
  { label: "Wallet", path: "/app/wallet" },
  { label: "Deals", path: "/app/deals" },
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
  const avatarUrl = user?.profile?.profilePictureUrl || "";
  const isProUser = Boolean(user?.subscription?.isAnyPro);

  const onLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    nav("/auth/login", { replace: true });
  };

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
      className="fixed top-0 left-0 right-0 z-50 w-full h-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6"
    >
      {/* Logo Area */}
      <Link to="/app/explore" className="flex items-center gap-3 w-48">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 overflow-hidden">
          <img src="/favicon.ico" alt="InvestHub logo" className="w-full h-full object-cover" />
        </div>
        <span className="text-white font-bold tracking-wide text-lg hidden sm:block">InvestHub</span>
      </Link>

      {/* Desktop Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activePath === link.path
                ? "bg-blue-500/10 border border-blue-400/20 text-white shadow-[0_0_18px_rgba(59,130,246,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4 justify-end">
        
        {/* Notification Dropdown (Restored from main branch) */}
        <NotificationDropdown />

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((s) => !s);
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 px-2 py-1.5 transition-all"
          >
            <div className="h-9 w-9 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {isProUser ? (
              <span className="-ml-4 mt-5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-900 border border-amber-200 shadow-lg">
                <Crown className="w-3 h-3" />
              </span>
            ) : null}
            <div className="hidden md:flex flex-col items-start text-left mr-2">
              <span className="text-sm font-bold text-white leading-none">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                {user?.roles?.[0] || "USER"}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0B0D10]/95 backdrop-blur-xl p-2 shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <Link to="/app/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
                <User className="w-4 h-4 text-slate-400" /> Profile
              </Link>
              <Link to="/app/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => {
            setMobileOpen((s) => !s);
            setProfileOpen(false);
          }}
          className="lg:hidden p-2 rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileOpen && (
        <div className="absolute top-[85px] left-4 right-4 rounded-2xl border border-white/10 bg-[#0B0D10]/95 backdrop-blur-xl p-4 shadow-2xl lg:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activePath === link.path
                    ? "bg-blue-500/10 text-white border border-blue-400/20 shadow-[0_0_18px_rgba(59,130,246,0.2)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link onClick={() => setMobileOpen(false)} to="/privacy" className="px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white">
              Privacy Policy
            </Link>
            <Link onClick={() => setMobileOpen(false)} to="/terms" className="px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white">
              Terms of Service
            </Link>
            <div className="h-px bg-white/10 my-2" />
            <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10">
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}