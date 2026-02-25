import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import api from "../../../services/api";
import { detectTenant } from "../../../core/tenant/tenant";
import { getPortalBootstrap, type PortalModule } from "../../../services/portal";

type Ticket = { id: string; title: string; status: string };

function getTableFromPath(path: string): string | null {
  const query = path.split("?")[1];
  if (!query) {
    return null;
  }

  return new URLSearchParams(query).get("table");
}

export default function CustomerPortal() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [moduleCards, setModuleCards] = useState<PortalModule[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const tenant = detectTenant();

  const selectedTable = useMemo(
    () => new URLSearchParams(location.search).get("table"),
    [location.search]
  );

  useEffect(() => {
    const loadModules = async () => {
      try {
        const bootstrap = await getPortalBootstrap(tenant.subdomain);
        const customerModules = bootstrap.portals.customer.modules;
        setModuleCards(customerModules);

        const tables = customerModules
          .map((module) => getTableFromPath(module.path))
          .filter((tableName): tableName is string => Boolean(tableName));

        setAvailableTables(Array.from(new Set(tables)));
      } catch {
        setModuleCards([]);
        setAvailableTables([]);
      }
    };

    loadModules();
  }, [tenant.subdomain]);

  useEffect(() => {
    const loadTickets = async () => {
      const tablesToTry = selectedTable ? [selectedTable] : availableTables;

      for (const tableName of tablesToTry) {
        try {
          const response = await api.get(`/data/${tableName}/`);
          const rows = (response.data || []).map((row: any) => ({
            id: String(row.id || row.number || row.sys_id || ""),
            title: row.title || row.short_description || "Untitled",
            status: row.status || "Open",
          }));
          setTickets(rows);
          return;
        } catch {
          continue;
        }
      }

      setTickets([]);
    };

    loadTickets();
  }, [selectedTable, availableTables]);

  const openTickets = useMemo(
    () => tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status.toLowerCase())).length,
    [tickets]
  );

  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status.toLowerCase())).length,
    [tickets]
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-2 text-lg">Everything you need, all in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Open Records</p>
          <h2 className="text-3xl font-bold mt-2">{openTickets}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Resolved</p>
          <h2 className="text-3xl font-bold mt-2">{resolvedTickets}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Active Module</p>
          <h2 className="text-xl font-bold mt-2">{selectedTable || availableTables[0] || "None"}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {moduleCards.length > 0 ? (
          moduleCards.map((module) => (
            <div
              key={module.path}
              onClick={() => navigate(module.path)}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
              <p className="text-sm text-gray-500">Open {module.name.toLowerCase()} records for your tenant.</p>
            </div>
          ))
        ) : (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl col-span-3">
            <h3 className="text-xl font-semibold mb-2">No subscribed modules yet</h3>
            <p className="text-sm opacity-90">
              Subscribe tenant modules from platform admin to generate customer portal modules automatically.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6">Recent Records</h2>

        <div className="space-y-4">
          {tickets.slice(0, 5).map((ticket) => (
            <div
              key={ticket.id}
              className="flex justify-between items-center p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-medium">#{ticket.id}</p>
                <p className="text-sm text-gray-500">{ticket.title}</p>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{ticket.status}</span>
            </div>
          ))}

          {tickets.length === 0 && <p className="text-sm text-gray-500">No activity yet for this module.</p>}
        </div>
      </div>
    </div>
  );
}
