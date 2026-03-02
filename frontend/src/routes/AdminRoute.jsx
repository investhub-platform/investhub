import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function AdminRoute() {
  const { booting, isAuthed, isAdmin } = useAuth();

  if (booting) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 grid place-items-center">
        <div className="text-sm">Loading session...</div>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return <Outlet />;
}