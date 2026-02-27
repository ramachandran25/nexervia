import { Outlet } from "react-router-dom";

export default function MinimalLayout() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <Outlet />
    </div>
  );
}