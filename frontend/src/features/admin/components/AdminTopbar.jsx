import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials =
    (user?.name || "A")
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  const onLogout = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <header className="h-20 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl px-8 flex items-center justify-between">
      <div>
        <h2 className="text-white text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage users and platform operations
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold flex items-center justify-center">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">{user?.name || "Admin"}</p>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              {user?.roles?.join(", ") || "admin"}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-300 hover:bg-red-500/15 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}