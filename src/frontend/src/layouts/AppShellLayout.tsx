import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { detectTenant } from "../core/tenant/tenant";

interface Props {
  portal: "support" | "businessAdmin";
}


export default function AppShellLayout({ portal }: Props) {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "favorites">("all");
  const navigate = useNavigate();

  const [modules, setModules] = useState<{ name: string; path: string }[]>([]);
  const [portalLabel, setPortalLabel] = useState("RK Projects");
  const tenant = detectTenant();

  useEffect(() => {
    const tenantName =
      tenant.subdomain.charAt(0).toUpperCase() +
      tenant.subdomain.slice(1);

    const baseLabel = `${tenantName}`;

    if (portal === "support") {
      setPortalLabel(`${baseLabel} - Support`);
      setModules([
        { name: "Dashboard", path: "/support" },
        { name: "Tickets", path: "/support/tickets" },
      ]);
    }

    if (portal === "businessAdmin") {
      setPortalLabel(`${baseLabel} - Admin`);
      setModules([
        { name: "Dashboard", path: "/admin" },
        { name: "Users", path: "/admin/users" },
        { name: "Groups", path: "/admin/groups" },
        { name: "Workflows", path: "/admin/workflows" },
      ]);
    }
  }, [portal, tenant.subdomain]);


  const pathParts = location.pathname.split("/");
  const moduleKey = pathParts[2];

  const [favorites, setFavorites] = useState<string[]>(
    JSON.parse(localStorage.getItem("module_favorites") || "[]")
  );

  const toggleFavorite = (modulePath: string) => {
    let updated;

    if (favorites.includes(modulePath)) {
      updated = favorites.filter((f) => f !== modulePath);
    } else {
      updated = [...favorites, modulePath];
    }

    setFavorites(updated);
    localStorage.setItem("module_favorites", JSON.stringify(updated));
  };
  const moduleName =
    modules.find((m) => m.path.includes(moduleKey))?.name ||
    "Dashboard";

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* TOP NAVBAR */}
      <div className="h-[64px] bg-white border-b flex items-center justify-between px-8 shadow-sm">

        <div className="font-semibold text-lg">
          {portalLabel}
        </div>

        <div className="text-lg font-medium">
          {moduleName}
        </div>

        <div className="flex items-center gap-6">
          <input
            placeholder="Search..."
            className="border rounded-md px-4 py-2 text-sm w-[260px]"
          />

          <span className="text-sm text-gray-600">
            User
          </span>

          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <div
          className={`${collapsed ? "w-[70px]" : "w-[240px]"} 
          bg-white border-r flex flex-col transition-all`}
        >

          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            {!collapsed && <span className="font-semibold">Modules</span>}
            <button onClick={() => setCollapsed(!collapsed)}>☰</button>
          </div>

          {/* View Toggle */}
          {!collapsed && (
            <div className="px-3 py-2 border-b flex gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`flex-1 text-sm px-3 py-1 rounded-md transition ${
                  viewMode === "all"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setViewMode("favorites")}
                className={`flex-1 text-sm px-3 py-1 rounded-md transition ${
                  viewMode === "favorites"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                Favorites
              </button>
            </div>
          )}

          {/* Search */}
          {!collapsed && (
            <div className="p-3 border-b">
              <input
                placeholder="Search modules..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
            </div>
          )}

          {/* Module List */}
          <div className="flex-1 overflow-y-auto">

            {modules
              .filter((m) =>
                m.name.toLowerCase().includes(moduleSearch.toLowerCase())
              )
              .filter((m) =>
                viewMode === "favorites"
                  ? favorites.includes(m.path)
                  : true
              )
              .map((module) => (
                <div
                  key={module.path}
                  className={`px-6 py-3 cursor-pointer text-sm flex justify-between items-center transition
                    ${
                      location.pathname.startsWith(module.path)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => navigate(module.path)}
                >
                  {!collapsed && (
                    <>
                      <span>{module.name}</span>

                      {/* Favorite Icon */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(module.path);
                        }}
                        className={`text-sm cursor-pointer ${
                          favorites.includes(module.path)
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }`}
                      >
                        ★
                      </span>
                    </>
                  )}

                  {collapsed && "•"}
                </div>
              ))}

          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* CONTENT NAVBAR */}
          <div className="h-[56px] bg-white border-b flex items-center justify-between px-6">
            <div>
              <button className="px-4 py-2 bg-gray-100 rounded-md text-sm">
                Filter
              </button>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                New
              </button>

              <button className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm">
                Export
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
}