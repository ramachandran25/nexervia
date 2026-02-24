import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import { detectTenant } from "../../../core/tenant/tenant";




export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [branding, setBranding] = useState<any>(null);

  console.log("USER:", user);
  console.log("USER ROLE TYPE:", typeof user?.role);

  const tenant = detectTenant();

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch(
          `/tenants/${tenant.subdomain}/config.json`
        );
        const data = await res.json();
        setBranding(data);
      } catch (err) {
        console.error("Branding load error:", err);
      }
    }

    loadBranding();
  }, [tenant.subdomain]);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  if (!branding) return null; // Prevent crash

  return (
    <>
      <nav className="w-full h-[60px] flex items-center justify-between px-8 border-b bg-white shadow-sm">
        {/* LEFT */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={`/tenants/${tenant.subdomain}/logo.png`}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-semibold text-lg">
            {branding.company_name}
          </span>
        </div>

        {/* CENTER */}
        <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
          <button
            onClick={() => navigate("/")}
            className="hover:text-blue-600 transition"
          >
            Home
          </button>

          <button
            onClick={() =>
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-blue-600 transition"
          >
            Services
          </button>

          <button
            onClick={() =>
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-blue-600 transition"
          >
            Pricing
          </button>

          <button
            onClick={() =>
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-blue-600 transition"
          >
            Contact
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition text-sm font-medium"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">
                {user?.name} ({typeof user?.role === "string" ? user.role : user?.role?.name})
              </span>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-black transition text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <ConfirmModal
        open={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}