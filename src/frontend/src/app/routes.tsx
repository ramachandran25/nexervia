import { Routes, Route, Navigate } from "react-router-dom";
import { detectTenant } from "../core/tenant/tenant";
import RoleGuard from "../core/auth/RoleGuard";

/* Layouts */
import PlatformLayout from "../layouts/PlatformLayout";
import PublicTenantLayout from "../layouts/PublicTenantLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import AppShellLayout from "../layouts/AppShellLayout";

/* Public Pages */
import LandingPage from "../portals/tenant-landing/pages/LandingPage";
import LoginPage from "../portals/tenant-landing/pages/LoginPage";
import SignupPage from "../portals/tenant-landing/pages/SignupPage";

/* Support Pages */
import TicketListView from "../portals/support/pages/TicketListView";
import TicketFormView from "../portals/support/pages/TicketFormView";

/* Customer */
import CustomerPortal from "../portals/customer/pages/CustomerPortal";

function Placeholder({ label }: { label: string }) {
  return <div className="text-2xl font-semibold">{label}</div>;
}

export default function AppRoutes() {
  const tenant = detectTenant();

  /* =========================
     PLATFORM ROUTES
  ========================== */
  if (tenant.isPlatform) {
    return (
      <Routes>
        <Route element={<PlatformLayout />}>
          <Route path="/" element={<Placeholder label="Platform Dashboard" />} />
        </Route>
      </Routes>
    );
  }

  /* =========================
     TENANT ROUTES
  ========================== */
  return (
    <Routes>

      {/* PUBLIC LANDING + AUTH */}
      <Route element={<PublicTenantLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* =========================
          CUSTOMER PORTAL
      ========================== */}
      <Route element={<CustomerLayout />}>
        <Route
          path="/customer"
          element={
            <RoleGuard allowedRoles={["customer_user"]}>
              <CustomerPortal />
            </RoleGuard>
          }
        />
      </Route>

      {/* =========================
          SUPPORT PORTAL
      ========================== */}
      <Route element={<AppShellLayout portal="support" />}>

        {/* Default redirect */}
        <Route
          path="/support"
          element={<Navigate to="/support/tickets" replace />}
        />

        <Route
          path="/support/tickets"
          element={
            <RoleGuard allowedRoles={["support_user"]}>
              <TicketListView />
            </RoleGuard>
          }
        />

        <Route
          path="/support/tickets/:id"
          element={
            <RoleGuard allowedRoles={["support_user"]}>
              <TicketFormView />
            </RoleGuard>
          }
        />
      </Route>

      {/* =========================
          BUSINESS ADMIN PORTAL
      ========================== */}
      <Route element={<AppShellLayout portal="businessAdmin" />}>

        {/* Default redirect */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/users" replace />}
        />

        <Route
          path="/admin/users"
          element={
            <RoleGuard allowedRoles={["tenant_admin"]}>
              <Placeholder label="Users List View" />
            </RoleGuard>
          }
        />

        <Route
          path="/admin/groups"
          element={
            <RoleGuard allowedRoles={["tenant_admin"]}>
              <Placeholder label="Groups List View" />
            </RoleGuard>
          }
        />

        <Route
          path="/admin/workflows"
          element={
            <RoleGuard allowedRoles={["tenant_admin"]}>
              <Placeholder label="Workflows" />
            </RoleGuard>
          }
        />
      </Route>

    </Routes>
  );
}