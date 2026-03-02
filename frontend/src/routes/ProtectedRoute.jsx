import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
export default function ProtectedRoute() {
  const { booting, isAuthed } = useAuth();

  if (booting) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 grid place-items-center">
        <div className="text-sm">Loading session...</div>
      </div>
    );
  }

  return isAuthed ? <Outlet /> : <Navigate to="/" replace />;
}