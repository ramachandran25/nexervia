import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { useEffect, useState } from "react";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import { detectTenant } from "../../../core/tenant/tenant";
import { getPortalBootstrap, type PortalModule } from "../../../services/portal";

export default function CustomerTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [companyName, setCompanyName] = useState("Nexervia");
  const [modules, setModules] = useState<PortalModule[]>([]);
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

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="h-[64px] w-full bg-white border-b shadow-sm flex items-center justify-between px-10">
      <div className="text-lg font-semibold cursor-pointer" onClick={() => navigate("/customer")}>
        {companyName}
      </div>

      <div className="flex gap-8 text-sm font-medium text-gray-600">
        {modules.map((module) => (
          <button
            key={module.path}
            onClick={() => navigate(module.path)}
            className="hover:text-blue-600 transition"
          >
            {module.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.name}</span>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black transition"
        >
          Logout
        </button>
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
