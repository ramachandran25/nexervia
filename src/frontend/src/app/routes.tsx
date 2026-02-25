import { Routes, Route, Navigate } from "react-router-dom";
import { detectTenant } from "../core/tenant/tenant";
import RoleGuard from "../core/auth/RoleGuard";
import { useAuth } from "../core/auth/useAuth";

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

/* Business Admin Placeholder */
function Placeholder({ label }: { label: string }) {
  return <div className="text-2xl font-semibold">{label}</div>;
}

export default function AppRoutes() {
  const tenant = detectTenant();
  const { isAuthenticated } = useAuth();

  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      {/* =====================================================
         GLOBAL AUTH ROUTES (WORKS ON PLATFORM + TENANT)
      ====================================================== */}
      <Route element={<PublicTenantLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>


      {/* =====================================================
         PLATFORM ROUTES
         platform.localhost
      ====================================================== */}
      {tenant.isPlatform && (
        <Route element={<PlatformLayout />}>
          <Route path="/" element={<Placeholder label="Platform Dashboard" />} />
        </Route>
      )}


      {/* =====================================================
         TENANT ROUTES
         rkp.localhost, tenant1.localhost, etc
      ====================================================== */}
      {!tenant.isPlatform && (
        <>
          {/* --------------------------
              PUBLIC LANDING PAGE
          --------------------------- */}
          <Route element={<PublicTenantLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>


          {/* --------------------------
              CUSTOMER PORTAL
          --------------------------- */}
          <Route element={<CustomerLayout />}>
            <Route
              path="/customer"
              element={
                <RoleGuard>
                  <CustomerPortal />
                </RoleGuard>
              }
            />
          </Route>


          {/* --------------------------
              SUPPORT PORTAL
          --------------------------- */}
          <Route element={<AppShellLayout portal="support" />}>

            {/* Default redirect */}
            <Route
              path="/support"
              element={<Navigate to="/support/tickets" replace />}
            />

            <Route
              path="/support/tickets"
              element={
                <RoleGuard>
                  <TicketListView />
                </RoleGuard>
              }
            />

            <Route
              path="/support/tickets/:id"
              element={
                <RoleGuard>
                  <TicketFormView />
                </RoleGuard>
              }
            />

          </Route>


          {/* --------------------------
              BUSINESS ADMIN PORTAL
          --------------------------- */}
          <Route element={<AppShellLayout portal="businessAdmin" />}>

            <Route
              path="/admin"
              element={<Navigate to="/admin/users" replace />}
            />

            <Route
              path="/admin/users"
              element={
                <RoleGuard>
                  <Placeholder label="Users List View" />
                </RoleGuard>
              }
            />

            <Route
              path="/admin/groups"
              element={
                <RoleGuard>
                  <Placeholder label="Groups List View" />
                </RoleGuard>
              }
            />

            <Route
              path="/admin/workflows"
              element={
                <RoleGuard>
                  <Placeholder label="Workflows" />
                </RoleGuard>
              }
            />

          </Route>
        </>
      )}


      {/* =====================================================
         FALLBACK ROUTE
      ====================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}