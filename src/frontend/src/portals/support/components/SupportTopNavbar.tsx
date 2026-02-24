import { useAuth } from "../../../core/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function SupportTopNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract module name from URL
  const pathParts = location.pathname.split("/");
  const moduleName =
    pathParts[2]?.charAt(0).toUpperCase() +
    pathParts[2]?.slice(1) || "Dashboard";

  return (
    <div className="h-[64px] w-full bg-white border-b shadow-sm flex items-center justify-between px-8">

      {/* LEFT: Tenant Branding */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/support/tickets")}
      >
        <span className="font-semibold text-lg">
          RK Projects
        </span>
      </div>

      {/* CENTER: Dynamic Module Name */}
      <div className="text-lg font-semibold text-gray-700">
        {moduleName}
      </div>

      {/* RIGHT: Search + User */}
      <div className="flex items-center gap-6">

        {/* Global Search */}
        <input
          placeholder="Search..."
          className="border rounded-md px-4 py-2 text-sm w-[280px]"
        />

        <span className="text-sm text-gray-600">
          {user?.name}
        </span>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm"
        >
          Logout
        </button>
      </div>

    </div>
  );
}