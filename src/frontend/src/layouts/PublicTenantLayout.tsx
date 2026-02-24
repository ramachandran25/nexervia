import { Outlet } from "react-router-dom";
import Navbar from "../portals/tenant-landing/components/Navbar";
import Footer from "../portals/tenant-landing/components/Footer";

export default function PublicTenantLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}