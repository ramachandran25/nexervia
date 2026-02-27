import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { detectTenant } from "../core/tenant/tenant";
import {
  getPortalBootstrap,
  type PortalModule,
  type PortalModuleGroup,
  type PortalTableNode,
} from "../services/portal";

interface Props {
  portal: "support" | "businessAdmin";
}

function normalizePath(path: string) {
  return path.replace(/\/+$/, "");
}

function getPathWithoutQuery(path: string) {
  return path.split("?")[0];
}

function isSameRoute(currentPath: string, targetPath: string) {
  return normalizePath(currentPath) === normalizePath(targetPath);
}

export default function AppShellLayout({ portal }: Props) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [moduleSearch, setModuleSearch] = useState("");
  const [portalLabel, setPortalLabel] = useState("Portal");
  const [modules, setModules] = useState<PortalModule[]>([]);
  const [moduleGroups, setModuleGroups] = useState<PortalModuleGroup[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const tenant = detectTenant();

  useEffect(() => {
    const tenantName = tenant.subdomain.charAt(0).toUpperCase() + tenant.subdomain.slice(1);

    const loadPortalConfig = async () => {
      try {
        const bootstrap = await getPortalBootstrap(tenant.subdomain);

        if (portal === "support") {
          setPortalLabel(`${tenantName} - ${bootstrap.portals.support.label}`);
          setModules(bootstrap.portals.support.modules);
          setModuleGroups(bootstrap.portals.support.module_groups || []);
          return;
        }

        setPortalLabel(`${tenantName} - ${bootstrap.portals.admin.label}`);
        setModules(bootstrap.portals.admin.modules);
        setModuleGroups(bootstrap.portals.admin.module_groups || []);
      } catch {
        setPortalLabel(`${tenantName} - ${portal === "support" ? "Support Portal" : "Business Admin"}`);
        setModules([]);
        setModuleGroups([]);
      }
    };

    loadPortalConfig();
  }, [portal, tenant.subdomain]);

  useEffect(() => {
    const defaultExpandedModules: Record<string, boolean> = {};
    const defaultExpandedTables: Record<string, boolean> = {};

    moduleGroups.forEach((group) => {
      defaultExpandedModules[group.name] = true;
      group.tables.forEach((table) => {
        defaultExpandedTables[`${group.name}:${table.name}`] = false;
      });
    });

    setExpandedModules(defaultExpandedModules);
    setExpandedTables(defaultExpandedTables);
  }, [moduleGroups]);

  const sidebarGroups = useMemo(() => {
    const search = moduleSearch.trim().toLowerCase();

    if (!search) {
      return moduleGroups;
    }

    return moduleGroups
      .map((group) => ({
        ...group,
        tables: group.tables.filter((table) => {
          if (table.name.toLowerCase().includes(search)) {
            return true;
          }

          return table.filters.some((filter) => filter.name.toLowerCase().includes(search));
        }),
      }))
      .filter((group) => group.name.toLowerCase().includes(search) || group.tables.length > 0);
  }, [moduleGroups, moduleSearch]);

  const currentRoute = `${location.pathname}${location.search}`;

  const moduleName =
    modules.find((module) => {
      const modulePath = getPathWithoutQuery(module.path);
      return location.pathname.startsWith(modulePath);
    })?.name || "Dashboard";

  const toggleModule = (moduleNameToToggle: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleNameToToggle]: !prev[moduleNameToToggle],
    }));
  };

  const toggleTable = (tableKey: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableKey]: !prev[tableKey],
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="h-[64px] bg-white border-b flex items-center justify-between px-8 shadow-sm">
        <div className="font-semibold text-lg">{portalLabel}</div>
        <div className="text-lg font-medium">{moduleName}</div>

        <div className="flex items-center gap-6">
          <input placeholder="Search..." className="border rounded-md px-4 py-2 text-sm w-[260px]" />
          <span className="text-sm text-gray-600">User</span>
          <button onClick={logout} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${collapsed ? "w-[70px]" : "w-[320px]"} bg-white border-r flex flex-col transition-all`}>
          <div className="p-4 border-b flex justify-between items-center">
            {!collapsed && <span className="font-semibold">Subscribed Modules</span>}
            <button onClick={() => setCollapsed(!collapsed)}>☰</button>
          </div>

          {!collapsed && (
            <div className="p-3 border-b">
              <input
                placeholder="Search modules, tables, filters..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-sm"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {collapsed ? (
              <div className="p-4 text-center text-gray-500">•</div>
            ) : (
              sidebarGroups.map((group) => {
                const groupExpanded = expandedModules[group.name] ?? true;

                return (
                  <div key={group.name} className="border-b">
                    <button
                      onClick={() => toggleModule(group.name)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100"
                    >
                      <span className="font-medium text-sm text-gray-800">{group.name}</span>
                      <span className="text-xs text-gray-500">{groupExpanded ? "▾" : "▸"}</span>
                    </button>

                    {groupExpanded && (
                      <div className="pb-2">
                        {group.tables.map((table: PortalTableNode) => {
                          const tableKey = `${group.name}:${table.name}`;
                          const tableExpanded = expandedTables[tableKey] ?? false;

                          return (
                            <div key={tableKey} className="px-4">
                              <button
                                onClick={() => toggleTable(tableKey)}
                                className="w-full py-2 text-left flex items-center justify-between text-sm text-gray-700 hover:text-blue-600"
                              >
                                <span>{table.name}</span>
                                <span className="text-xs text-gray-500">{tableExpanded ? "▾" : "▸"}</span>
                              </button>

                              {tableExpanded && (
                                <div className="pl-3 pb-2 space-y-1">
                                  {table.filters.map((filter) => {
                                    const active =
                                      isSameRoute(currentRoute, filter.path) ||
                                      isSameRoute(location.pathname, getPathWithoutQuery(filter.path));

                                    return (
                                      <button
                                        key={filter.path}
                                        onClick={() => navigate(filter.path)}
                                        className={`block w-full text-left px-2 py-1 rounded text-xs ${
                                          active
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                      >
                                        {filter.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[56px] bg-white border-b flex items-center justify-between px-6">
            <div>
              <button className="px-4 py-2 bg-gray-100 rounded-md text-sm">Filter</button>
            </div>

            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">New</button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm">Export</button>
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
