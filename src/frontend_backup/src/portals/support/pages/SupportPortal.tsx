import { useState } from "react";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: "low" | "medium" | "high";
}

const dummyTickets: Ticket[] = [
  { id: "1023", title: "Login issue", status: "Open", priority: "high" },
  { id: "1024", title: "Payment failure", status: "In Progress", priority: "medium" },
  { id: "1025", title: "API error 500", status: "Open", priority: "high" },
];

export default function SupportPortal() {
  const [selected, setSelected] = useState<Ticket | null>(dummyTickets[0]);

  return (
    <>
      {/* LEFT PANEL */}
      <div className="w-[350px] bg-white border-r overflow-y-auto">

        <div className="p-4 border-b font-semibold">
          Tickets
        </div>

        {dummyTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelected(ticket)}
            className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
              selected?.id === ticket.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                #{ticket.id}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ticket.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : ticket.priority === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {ticket.priority}
              </span>
            </div>

            <div className="text-sm text-gray-600 mt-1">
              {ticket.title}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              {ticket.status}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-8 overflow-y-auto">

        {selected ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">
                Ticket #{selected.id}
              </h2>
              <p className="text-gray-600 mt-2">
                {selected.title}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h3 className="font-semibold mb-4">Details</h3>
              <p>Status: {selected.status}</p>
              <p>Priority: {selected.priority}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Work Notes</h3>
              <textarea
                placeholder="Add work note..."
                className="w-full border rounded-lg p-3 min-h-[120px]"
              />
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
                Add Note
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400">
            Select a ticket to view details
          </div>
        )}

      </div>
    </>
  );
}