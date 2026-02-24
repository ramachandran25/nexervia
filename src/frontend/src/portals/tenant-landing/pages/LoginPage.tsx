import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer_user"); // default role

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fakeUser = {
      id: "1",
      name: username || "Demo User",
      role: role,
    };

    login(fakeUser);

    switch (fakeUser.role) {
      case "tenant_admin":
        navigate("/admin");
        break;
      case "support_user":
        navigate("/support");
        break;
      case "customer_user":
        navigate("/customer");
        break;
      case "platform_admin":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-lg px-4 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 🔥 ROLE SELECTOR FOR TESTING */}
          <select
            className="w-full border rounded-lg px-4 py-2 bg-gray-50"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer_user">Customer User</option>
            <option value="support_user">Support User</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="platform_admin">Platform Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign In
          </button>

        </form>
      </div>
    </div>
  );
}