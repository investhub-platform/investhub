import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../features/auth/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

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
    nav("/"); // ✅ landing page
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
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto relative flex items-center gap-3 px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-lg max-w-4xl w-full mx-4">
        {/* Logo */}
        <Link to="/app" className="flex items-center gap-3">
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
        <nav className="flex-1 justify-center gap-6 text-sm text-slate-300 hidden md:flex">
          <Link to="/app" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/app/profile" className="hover:text-white transition-colors">
            Profile
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
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
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 grid place-items-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="hidden sm:block text-sm text-slate-200 max-w-[140px] truncate">
                {user?.name || "User"}
              </span>
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
              <Link
                to="/app"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/5"
              >
                Dashboard
              </Link>
              <Link
                to="/app/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/5"
              >
                Profile
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