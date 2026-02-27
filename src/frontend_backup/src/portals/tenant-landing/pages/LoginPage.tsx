import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth/useAuth";
import { useLocation } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState("customer_user");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);

      // 🔥 DEV MODE PORTAL SELECTION
      switch (portal) {
        case "platform_admin":
          navigate("/");
          break;
        case "tenant_admin":
          navigate("/admin");
          break;
        case "support_user":
          navigate("/support");
          break;
        case "customer_user":
          navigate("/customer");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Sign In
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* DEV MODE PORTAL SELECTOR */}
          <select
            className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
          >
            <option value="customer_user">Customer Portal</option>
            <option value="support_user">Support Portal</option>
            <option value="tenant_admin">Business Admin Portal</option>
            <option value="platform_admin">Platform Admin Portal</option>
          </select>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

      </div>
    </div>
  );
}