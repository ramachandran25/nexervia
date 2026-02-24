import { Outlet } from "react-router-dom";
import CustomerTopbar from "../portals/customer/components/CustomerTopbar";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <CustomerTopbar />
      <main className="px-12 py-10">
        <Outlet />
      </main>
    </div>
  );
}