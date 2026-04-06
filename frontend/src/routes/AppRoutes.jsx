import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "../pages/marketing/LandingPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage";
import PrivacyPolicy from "../pages/policy/PrivacyPolicy";
import TermsOfService from "../pages/policy/TermsOfService";
import ProfilePage from "../pages/app/ProfilePage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import InvestorDashboard from "../pages/InvestorDashboard";
import MentorDashboard from "../pages/MentorDashboard";
import StartupOwnerDashboard from "../pages/StartupOwnerDashboard";
import StartupDetails from "../pages/StartupDetails";
import StartupModal from "../pages/StartupModal";
import PortfolioPage from "../pages/app/PortfolioPage";
import InvestmentDashboard from "../pages/app/InvestmentDashboard";
import SettingsPage from "../pages/app/SettingsPage";
import WalletPage from "../pages/app/WalletPage";
import TransactionsPage from "../pages/app/TransactionsPage";
import AdminLayout from "../features/admin/components/AdminLayout";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "../features/admin/pages/AdminUsersPage";
import AdminUserPage from "../features/admin/pages/AdminUserPage";
import AdminStartupsPage from "../features/admin/pages/AdminStartupsPage";
import AdminRevenuePage from "../features/admin/pages/AdminRevenuePage";
import MessagesPage from "../pages/app/MessagesPage";

export default function AppRoutes() {
  const location = useLocation();
  const state = location.state;
  const background = state && state.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

      {/* Auth pages ( create next) */}
       <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<Navigate to="/app/explore" replace />} />
        <Route path="/app/explore" element={<InvestorDashboard />} />
        <Route path="/app/portfolio" element={<PortfolioPage />} />
          <Route path="/app/deals" element={<InvestmentDashboard />} />
        <Route path="/app/mentor" element={<MentorDashboard />} />
        <Route path="/app/founder" element={<StartupOwnerDashboard />} />
        <Route path="/app/startup/:id" element={<StartupDetails />} />
        <Route path="/app/idea/:id" element={<StartupDetails />} />
        <Route path="/app/plan/:id" element={<StartupDetails />} />
        <Route path="/app/profile" element={<ProfilePage />} />
        <Route path="/app/wallet" element={<WalletPage />} />
        <Route path="/app/wallet/transactions" element={<TransactionsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
      </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<Navigate to="/app/explore" replace />} />
          <Route path="/app/explore" element={<InvestorDashboard />} />
          <Route path="/app/portfolio" element={<PortfolioPage />} />
          <Route path="/app/messages" element={<MessagesPage />} />
          <Route path="/app/mentor" element={<MentorDashboard />} />
          <Route path="/app/founder" element={<StartupOwnerDashboard />} />
          <Route path="/app/startup/:id" element={<StartupDetails />} />
          <Route path="/app/idea/:id" element={<StartupDetails />} />
          <Route path="/app/plan/:id" element={<StartupDetails />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/wallet" element={<WalletPage />} />
          <Route path="/app/wallet/transactions" element={<TransactionsPage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="users/:id" element={<AdminUserPage />} />
            <Route path="startups" element={<AdminStartupsPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="min-h-screen bg-[#020617] text-white p-6">404</div>} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/app/startup/:id" element={<StartupModal />} />
          <Route path="/app/idea/:id" element={<StartupModal />} />
          <Route path="/app/plan/:id" element={<StartupModal />} />
        </Routes>
      )}
    </>
  );
}