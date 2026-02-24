import { Outlet } from "react-router-dom";
import SupportTopNavbar from "../portals/support/components/SupportTopNavbar";
import SupportSidebar from "../portals/support/components/SupportSidebar";
import ContentNavbar from "../portals/support/components/ContentNavbar";

export default function SupportLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">

      <SupportTopNavbar />

      <div className="flex flex-1 overflow-hidden">

        <SupportSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <ContentNavbar />

          <div className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </div>

        </div>

      </div>
    </div>
  );
}