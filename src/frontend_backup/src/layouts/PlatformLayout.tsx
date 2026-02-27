import { Outlet } from "react-router-dom";

export default function PlatformLayout() {
  return (
    <div className="flex h-full bg-gray-900 text-white">
      <aside className="w-sidebar bg-gray-800 p-4">
        Platform Sidebar
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-topbar bg-gray-700 px-6 flex items-center">
          Platform Topbar
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}