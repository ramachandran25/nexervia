import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const modules = [
  { name: "Tickets", path: "/support/tickets" },
  { name: "SLAs", path: "/support/slas" },
  { name: "Knowledge", path: "/support/kb" },
  { name: "Reports", path: "/support/reports" },
];

export default function SupportSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = modules.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`${collapsed ? "w-[70px]" : "w-[240px]"} 
      bg-white border-r flex flex-col transition-all`}>

      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && <span className="font-semibold">Modules</span>}
        <button onClick={() => setCollapsed(!collapsed)}>
          ☰
        </button>
      </div>

      {!collapsed && (
        <div className="p-3">
          <input
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-2 rounded-md text-sm"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">

        {filtered.map((module) => (
          <div
            key={module.path}
            onClick={() => navigate(module.path)}
            className={`px-6 py-3 cursor-pointer text-sm transition
              ${
                location.pathname.startsWith(module.path)
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            {!collapsed ? module.name : "•"}
          </div>
        ))}

      </div>

    </div>
  );
}