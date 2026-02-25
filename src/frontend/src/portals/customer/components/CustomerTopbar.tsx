import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/useAuth";
import { useState } from "react";
import ConfirmModal from "../../../shared/components/ConfirmModal";

export default function CustomerTopbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="h-[64px] w-full bg-white border-b shadow-sm flex items-center justify-between px-10">

      {/* LEFT - Product Logo */}
      <div
        className="text-lg font-semibold cursor-pointer"
        onClick={() => navigate("/customer")}
      >
        Nexervia
      </div>

      {/* CENTER - Product Navigation */}
      <div className="flex gap-8 text-sm font-medium text-gray-600">
        <button
          onClick={() => navigate("/customer")}
          className="hover:text-blue-600 transition"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/customer/tickets")}
          className="hover:text-blue-600 transition"
        >
          Tickets
        </button>

        <button
          onClick={() => navigate("/customer/kb")}
          className="hover:text-blue-600 transition"
        >
          Knowledge Base
        </button>
      </div>

      {/* RIGHT - User */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {user?.name}
        </span>

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