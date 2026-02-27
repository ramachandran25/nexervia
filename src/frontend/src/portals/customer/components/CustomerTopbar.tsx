import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { useEffect, useState } from "react";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import { detectTenant } from "../../../core/tenant/tenant";
import { getPortalBootstrap, type PortalModule } from "../../../services/portal";

type CustomerView = "services" | "catalog" | "requests";

export default function CustomerTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [companyName, setCompanyName] = useState("Nexervia");
  const [modules, setModules] = useState<PortalModule[]>([]);
  const [modulesOpen, setModulesOpen] = useState(false);
  const tenant = detectTenant();

  useEffect(() => {
    const loadPortalConfig = async () => {
      try {
        const bootstrap = await getPortalBootstrap(tenant.subdomain);
        setCompanyName(bootstrap.branding.company_name || "Nexervia");
        setModules(bootstrap.portals.customer.modules);
      } catch {
        setCompanyName("Nexervia");
        setModules([]);
      }
    };

    loadPortalConfig();
  }, [tenant.subdomain]);

  useEffect(() => {
    if (!modulesOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModulesOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modulesOpen]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  const getView = (): CustomerView => {
    const view = new URLSearchParams(location.search).get("view");
    if (view === "services" || view === "catalog" || view === "requests") return view;
    const table = new URLSearchParams(location.search).get("table");
    return table ? "requests" : "services";
  };

  const currentView = getView();

  const navButtonClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <div className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-6 px-6">
        <div className="min-w-0">
          <button
            className="block truncate text-left text-base font-semibold text-slate-900"
            onClick={() => navigate("/customer")}
            title={companyName}
          >
            {companyName}
          </button>
          <div className="text-xs text-slate-500">Customer portal • {tenant.subdomain}</div>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            className={navButtonClass(currentView === "services")}
            onClick={() => navigate("/customer?view=services")}
          >
            Services
          </button>
          <button
            type="button"
            className={navButtonClass(currentView === "catalog")}
            onClick={() => navigate("/customer?view=catalog")}
          >
            Catalog
          </button>
          <button
            type="button"
            className={navButtonClass(currentView === "requests")}
            onClick={() => navigate("/customer?view=requests")}
          >
            My requests
          </button>

          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setModulesOpen((v) => !v)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Request types
            </button>

            {modulesOpen ? (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setModulesOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Available request types
                  </div>
                  <div className="max-h-[320px] overflow-y-auto p-2">
                    {modules.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-slate-600">
                        No request types provisioned yet.
                      </div>
                    ) : (
                      modules.map((module) => (
                        <button
                          key={module.path}
                          type="button"
                          onClick={() => {
                            setModulesOpen(false);
                            navigate(module.path);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <div className="font-medium text-slate-900">{module.name}</div>
                          <div className="text-xs text-slate-500">
                            Open and track your {module.name.toLowerCase()} requests
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-slate-900">{user?.name}</div>
            <div className="text-xs text-slate-500">Signed in</div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black"
          >
            Logout
          </button>
        </div>
      </div>
      <ConfirmModal
        open={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
