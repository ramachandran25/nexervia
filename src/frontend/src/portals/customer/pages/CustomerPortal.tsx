import { useAuth } from "../../../core/auth/AuthContext";

export default function CustomerPortal() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">

      {/* HERO */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Everything you need, all in one place.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Open Tickets</p>
          <h2 className="text-3xl font-bold mt-2">3</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Resolved</p>
          <h2 className="text-3xl font-bold mt-2">12</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
          <p className="text-sm text-gray-500">Avg Response</p>
          <h2 className="text-3xl font-bold mt-2">2.4h</h2>
        </div>

      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl hover:scale-105 transition cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">
            Create Ticket
          </h3>
          <p className="text-sm opacity-90">
            Raise a new support request instantly.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">
            My Tickets
          </h3>
          <p className="text-sm text-gray-500">
            Track ongoing issues in real time.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer">
          <h3 className="text-xl font-semibold mb-2">
            Knowledge Base
          </h3>
          <p className="text-sm text-gray-500">
            Browse helpful articles and FAQs.
          </p>
        </div>

      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-6">
          Recent Tickets
        </h2>

        <div className="space-y-4">

          <div className="flex justify-between items-center p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
            <div>
              <p className="font-medium">Ticket #1023</p>
              <p className="text-sm text-gray-500">
                Issue with login credentials
              </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
              Resolved
            </span>
          </div>

          <div className="flex justify-between items-center p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
            <div>
              <p className="font-medium">Ticket #1028</p>
              <p className="text-sm text-gray-500">
                Payment processing delay
              </p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
              In Progress
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}