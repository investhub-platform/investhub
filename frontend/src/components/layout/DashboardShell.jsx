import { useEffect, useState } from "react";
import AppNavbar from "./AppNavBar";
import { DesktopSidebar } from "../DesktopSidebar";

const SIDEBAR_COLLAPSED_KEY = "investhub:sidebarCollapsed";
const DEFAULT_MAIN_CLASS = "flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 scroll-smooth";

export default function DashboardShell({
  children,
  contentClassName = "max-w-6xl mx-auto",
  mainClassName = DEFAULT_MAIN_CLASS,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      // Ignore localStorage failures in restricted environments.
    }
  }, [sidebarCollapsed]);

  const resolvedMainClass = `${mainClassName} ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={setSidebarCollapsed}
        />

        <main className={resolvedMainClass}>
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
}
