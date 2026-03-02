import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth pages (we will create next) */}
       <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<div className="min-h-screen bg-[#020617] text-white p-6">Forgot Password</div>} />
      <Route path="/auth/reset-password" element={<div className="min-h-screen bg-[#020617] text-white p-6">Reset Password</div>} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<div className="min-h-screen bg-[#020617] text-white p-6">Dashboard</div>} />
        <Route path="/app/profile" element={<div className="min-h-screen bg-[#020617] text-white p-6">Profile</div>} />
        <Route path="/app/settings" element={<div className="min-h-screen bg-[#020617] text-white p-6">Settings</div>} />
      </Route>

      {/* Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/users" element={<div className="min-h-screen bg-[#020617] text-white p-6">Admin Users</div>} />
        <Route path="/admin/users/:id" element={<div className="min-h-screen bg-[#020617] text-white p-6">Admin User Details</div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen bg-[#020617] text-white p-6">404</div>} />
    </Routes>
  );
}