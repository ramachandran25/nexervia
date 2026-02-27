import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import api from "../../../services/api";
import { detectTenant } from "../../../core/tenant/tenant";
import { getPortalBootstrap, type PortalModule } from "../../../services/portal";
import CreateRequestModal from "../components/CreateRequestModal";
import RequestDetailsModal from "../components/RequestDetailsModal";

type Ticket = {
  id: string;
  number?: string;
  title: string;
  status: string;
  data: Record<string, unknown>;
};
type CustomerView = "services" | "catalog" | "requests";

type Offering = {
  key: string;
  name: string;
  path: string;
  table: string | null;
};

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createTable, setCreateTable] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<Ticket | null>(null);
  const tenant = detectTenant();
  const topRef = useRef<HTMLDivElement | null>(null);

  const selectedTable = useMemo(
    () => new URLSearchParams(location.search).get("table"),
    [location.search]
  );

  const view = useMemo((): CustomerView => {
    const params = new URLSearchParams(location.search);
    const v = params.get("view");
    if (v === "services" || v === "catalog" || v === "requests") return v;
    const table = params.get("table");
    return table ? "requests" : "services";
  }, [location.search]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const bootstrap = await getPortalBootstrap(tenant.subdomain);
        const customerModules = bootstrap.portals.customer.modules;
        setModuleCards(customerModules);

        const tables = customerModules
          .map((module) => getTableFromPath(module.path))
          .filter((tableName): tableName is string => Boolean(tableName));

        const uniqueTables = Array.from(new Set(tables));
        // Temporary fallback to ensure core service request table is available
        // even if not yet wired via portal bootstrap configuration.
        if (uniqueTables.length === 0) {
          setAvailableTables(["servex"]);
        } else {
          setAvailableTables(uniqueTables);
        }
      } catch {
        setModuleCards([]);
        // Fallback to core servex table so basic service request still works.
        setAvailableTables(["servex"]);
      }
    };

    loadModules();
  }, [tenant.subdomain]);

  const offerings = useMemo<Offering[]>(() => {
    return moduleCards.map((m) => {
      const table = getTableFromPath(m.path);
      return {
        key: m.path,
        name: m.name,
        path: m.path,
        table,
      };
    });
  }, [moduleCards]);

  const activeTable = useMemo(() => {
    if (selectedTable) return selectedTable;
    return availableTables[0] || null;
  }, [selectedTable, availableTables]);

  useEffect(() => {
    const loadTickets = async () => {
      const tablesToTry = activeTable ? [activeTable] : availableTables;
      if (tablesToTry.length === 0) {
        setTickets([]);
        return;
      }

      for (const tableName of tablesToTry) {
        try {
          const response = await api.get(`/data/${tableName}/`);
          const data = Array.isArray(response.data) ? (response.data as Record<string, unknown>[]) : [];
          const rows = data.map((row) => {
            const sysId = row.sys_id;
            const number = row.number;
            const title =
              row.title ??
              row.short_description ??
              "Untitled";
            const status = row.status ?? "Open";

            return {
              id: String(sysId ?? number ?? row.id ?? ""),
              number: number ? String(number) : undefined,
              title: String(title),
              status: String(status),
              data: row,
            };
          });
          setTickets(rows);
          return;
        } catch {
          continue;
        }
      }

      setTickets([]);
    };

    loadTickets();
  }, [view, activeTable, availableTables]);

  const openTickets = useMemo(
    () => tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status.toLowerCase())).length,
    [tickets]
  );

  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status.toLowerCase())).length,
    [tickets]
  );

  const pageTitle = useMemo(() => {
    if (view === "services") return "Services";
    if (view === "catalog") return "Catalog";
    return "My requests";
  }, [view]);

  const openCreateForTable = (table: string | null) => {
    if (!table) return;
    setCreateTable(table);
    setCreateOpen(true);
  };

  return (
    <div ref={topRef} className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-medium text-slate-600">Welcome back</div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {user?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {pageTitle} for <span className="font-medium text-slate-800">{tenant.subdomain}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/customer?view=catalog")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Browse catalog
            </button>
            <button
              type="button"
              onClick={() => {
                const table = activeTable;
                if (table) {
                  openCreateForTable(table);
                } else {
                  navigate("/customer?view=catalog");
                }
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black"
            >
              New request
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Open requests
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{openTickets}</div>
          <div className="mt-1 text-sm text-slate-600">Currently in progress or awaiting action</div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Resolved
          </div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{resolvedTickets}</div>
          <div className="mt-1 text-sm text-slate-600">Closed or completed requests</div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active request type
          </div>
          <div className="mt-2 truncate text-base font-semibold text-slate-900">
            {activeTable || "Not selected"}
          </div>
          <div className="mt-1 text-sm text-slate-600">Used for creating and listing requests</div>
        </div>
      </div>

      {view === "services" ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Services</h2>
              <p className="mt-1 text-sm text-slate-600">
                CSDM-ready view. Today we show provisioned request types; soon this will map to Business Services and Service Offerings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer?view=catalog")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View catalog
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offerings.length > 0 ? (
              offerings.map((offering) => (
                <div
                  key={offering.key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {offering.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Request, track, and manage delivery for this service.
                      </div>
                    </div>
                    {offering.table ? (
                      <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {offering.table}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/customer?view=catalog`);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Offerings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (offering.table) {
                          navigate(`/customer?view=requests&table=${encodeURIComponent(offering.table)}`);
                        } else {
                          navigate(offering.path);
                        }
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                    >
                      View requests
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:col-span-2 lg:col-span-3">
                <div className="text-base font-semibold text-slate-900">No services provisioned</div>
                <div className="mt-2 text-sm text-slate-600">
                  When modules are assigned to this tenant, the portal will automatically expose them as request types.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {view === "catalog" ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Catalog</h2>
              <p className="mt-1 text-sm text-slate-600">
                Request offerings (CSDM Service Offerings). For now these map directly to provisioned modules.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/customer?view=requests")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Go to requests
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {offerings.length > 0 ? (
              offerings.map((offering) => (
                <div
                  key={offering.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {offering.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Submit a new request and track delivery status.
                      </div>
                    </div>
                    {offering.table ? (
                      <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        {offering.table}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (offering.table) {
                          openCreateForTable(offering.table);
                        } else {
                          navigate(offering.path);
                        }
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                    >
                      Request
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (offering.table) {
                          navigate(`/customer?view=requests&table=${encodeURIComponent(offering.table)}`);
                        } else {
                          navigate(offering.path);
                        }
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View requests
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:col-span-2">
                <div className="text-base font-semibold text-slate-900">No catalog items yet</div>
                <div className="mt-2 text-sm text-slate-600">
                  Provision modules for this tenant to generate request offerings automatically.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {view === "requests" ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">My requests</h2>
              <p className="mt-1 text-sm text-slate-600">
                Track delivery status across your services.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={activeTable || ""}
                onChange={(e) => {
                  const t = e.target.value;
                  if (!t) {
                    navigate("/customer?view=requests");
                    return;
                  }
                  navigate(`/customer?view=requests&table=${encodeURIComponent(t)}`);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-[260px]"
              >
                <option value="" disabled>
                  Select request type…
                </option>
                {availableTables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openCreateForTable(activeTable)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-50"
                disabled={!activeTable}
              >
                New request
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-12 gap-0 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div className="col-span-3">ID</div>
                <div className="col-span-7">Title</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              <div className="divide-y divide-slate-200">
                {tickets.slice(0, 12).map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setDetailRecord(ticket);
                      setDetailOpen(true);
                    }}
                    className="grid w-full grid-cols-12 items-center gap-0 px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    <div className="col-span-3 font-medium text-slate-900">
                      #{ticket.number ?? ticket.id}
                    </div>
                    <div className="col-span-7 truncate text-slate-700">
                      {ticket.title}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">
                        {ticket.status}
                      </span>
                    </div>
                  </button>
                ))}

                {tickets.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-600">
                    No requests found for this request type.
                  </div>
                ) : null}
              </div>
            </div>

            {tickets.length > 12 ? (
              <div className="mt-3 text-xs text-slate-500">
                Showing 12 of {tickets.length} records.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <CreateRequestModal
        open={createOpen}
        title="New request"
        subtitle={createTable ? `Request type: ${createTable}` : undefined}
        table={createTable}
        onClose={() => setCreateOpen(false)}
        onSubmitted={() => {
          navigate(`/customer?view=requests&table=${encodeURIComponent(createTable || "")}`);
        }}
      />
      <RequestDetailsModal
        open={detailOpen}
        record={detailRecord?.data ?? null}
        onClose={() => {
          setDetailOpen(false);
          setDetailRecord(null);
        }}
      />
    </div>
  );
}
