import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import DashboardPage from "../pages/app/DashboardPage";
import ProfilePage from "../pages/app/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth pages ( create next) */}
       <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      {/* Protected */}
      <Route element={<ProtectedRoute />}>
           
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        
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