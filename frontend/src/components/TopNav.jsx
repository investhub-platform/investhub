// TopNav.jsx
import { Bell, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Explore", path: "/" },
  { label: "My Portfolio", path: "/portfolio" },
  { label: "Messages", path: "/messages" },
];

export function TopNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="nav-floating sticky top-4 z-50 mx-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-sm font-bold">
              IH
            </div>
            <span className="font-semibold text-lg hidden sm:inline">InvestHub</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? "gradient-blue text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-xs font-bold">
              JD
            </div>
            <span className="hidden sm:inline text-[10px] uppercase tracking-widest font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Investor
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-white/[0.07] z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-sm font-bold">
                    IH
                  </div>
                  <span className="font-semibold">InvestHub</span>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}