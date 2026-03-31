import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      <AdminSidebar />

      <div className="flex-1 min-w-0">
        <AdminTopbar />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}