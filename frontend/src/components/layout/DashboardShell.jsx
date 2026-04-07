import AppNavbar from "./AppNavBar";
import { DesktopSidebar } from "../DesktopSidebar";

const DEFAULT_MAIN_CLASS = "flex-1 w-full overflow-y-auto px-4 sm:px-8 py-8 lg:py-12 relative z-10 scroll-smooth md:ml-64 lg:ml-64";

export default function DashboardShell({
  children,
  contentClassName = "max-w-6xl mx-auto",
  mainClassName = DEFAULT_MAIN_CLASS,
}) {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">
      <AppNavbar />

      <div className="flex flex-1 pt-20 relative w-full h-screen overflow-hidden">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className={mainClassName}>
          <div className={contentClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
}
