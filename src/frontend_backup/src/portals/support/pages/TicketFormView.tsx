import { useParams } from "react-router-dom";
import { useState } from "react";

export default function TicketFormView() {
  const { id } = useParams();
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("High");
  const [notes, setNotes] = useState("");

  return (
    <div>

      <h2 className="text-xl font-semibold mb-6">
        Ticket #{id}
      </h2>

      <div className="bg-white p-6 rounded-xl shadow mb-6 space-y-4">

        <div>
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full border rounded-md px-4 py-2 mt-1"
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="block w-full border rounded-md px-4 py-2 mt-1"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Work Notes</h3>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add work note..."
          className="w-full border rounded-md p-3 min-h-[120px]"
        />

        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Add Note
        </button>
      </div>

    </div>
  );
}