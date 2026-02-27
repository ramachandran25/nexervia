import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { detectTenant } from "../../../core/tenant/tenant";
import { getPortalBootstrap } from "../../../services/portal";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

function getTableFromPath(path: string): string | null {
  const query = path.split("?")[1];
  if (!query) {
    return null;
  }

  return new URLSearchParams(query).get("table");
}

export default function TicketListView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const tenant = detectTenant();

  const selectedTable = useMemo(
    () => new URLSearchParams(location.search).get("table"),
    [location.search]
  );

  const selectedStatus = useMemo(
    () => (new URLSearchParams(location.search).get("status") || "all").toLowerCase(),
    [location.search]
  );

  useEffect(() => {
    const loadSupportModules = async () => {
      try {
        const bootstrap = await getPortalBootstrap(tenant.subdomain);
        const tables = bootstrap.portals.support.modules
          .map((module) => getTableFromPath(module.path))
          .filter((tableName): tableName is string => Boolean(tableName));
        setAvailableTables(Array.from(new Set(tables)));
      } catch {
        setAvailableTables([]);
      }
    };

    loadSupportModules();
  }, [tenant.subdomain]);

  useEffect(() => {
    const loadTickets = async () => {
      const tablesToTry = selectedTable ? [selectedTable] : availableTables;

      for (const tableName of tablesToTry) {
        try {
          const response = await api.get(`/data/${tableName}/`);
          const mapped = (response.data || []).map((row: any) => ({
            id: String(row.id || row.number || row.sys_id || ""),
            title: row.title || row.short_description || "Untitled",
            status: String(row.status || "Open"),
            priority: String(row.priority || "Medium"),
          }));
          setTickets(mapped);
          return;
        } catch {
          continue;
        }
      }

      setTickets([]);
    };

    loadTickets();
  }, [selectedTable, availableTables]);

  const filteredTickets = useMemo(() => {
    if (selectedStatus === "all") {
      return tickets;
    }

    if (selectedStatus === "open") {
      return tickets.filter((ticket) => !["closed", "resolved"].includes(ticket.status.toLowerCase()));
    }

    if (selectedStatus === "closed") {
      return tickets.filter((ticket) => ["closed", "resolved"].includes(ticket.status.toLowerCase()));
    }

    return tickets;
  }, [tickets, selectedStatus]);

  return (
    <div>
      <div className="mb-3 text-sm text-gray-500">
        View: <span className="font-medium text-gray-700">{selectedStatus}</span>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Title</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Priority</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() =>
                  navigate(
                    `/support/tickets/${ticket.id}${
                      selectedTable ? `?table=${selectedTable}&status=${selectedStatus}` : ""
                    }`
                  )
                }
                className="border-t hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-6 py-3">#{ticket.id}</td>
                <td className="px-6 py-3">{ticket.title}</td>
                <td className="px-6 py-3">{ticket.status}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      ticket.priority === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
