import { Outlet } from "react-router-dom";

export default function TenantLayout() {
  return (
    <div className="flex h-full bg-gray-50 text-gray-900">
      <aside className="w-sidebar bg-white border-r p-4">
        Tenant Sidebar
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-topbar bg-white border-b px-6 flex items-center">
          Tenant Topbar
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}