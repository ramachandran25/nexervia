import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

const dummyTickets: Ticket[] = [
  { id: "1023", title: "Login issue", status: "Open", priority: "High" },
  { id: "1024", title: "Payment failure", status: "In Progress", priority: "Medium" },
  { id: "1025", title: "API error 500", status: "Open", priority: "High" },
];

export default function TicketListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("id");

  const filtered = dummyTickets
    .filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sort === "priority"
        ? a.priority.localeCompare(b.priority)
        : a.id.localeCompare(b.id)
    );

  return (
    <div>
      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">ID</th>
              <th className="text-left px-6 py-3">Title</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Priority</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                className="border-t hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-6 py-3">#{ticket.id}</td>
                <td className="px-6 py-3">{ticket.title}</td>
                <td className="px-6 py-3">{ticket.status}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      ticket.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}