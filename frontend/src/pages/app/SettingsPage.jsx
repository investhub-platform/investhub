import AppNavbar from "../../components/layout/AppNavBar";
import { DesktopSidebar } from "../../components/DesktopSidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DesktopSidebar />
      <main className="flex-1 w-full">
        <AppNavbar />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 w-full">
          <h1 className="text-3xl heading-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences.</p>

          <div className="mt-8 obsidian-card p-6">
            <p className="text-sm text-muted-foreground">Settings controls will be connected to backend endpoints next.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
