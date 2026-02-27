import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../PageHeader";

interface Props {
  table: string;
}

const DynamicList = ({ table }: Props) => {
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [filtered, setFiltered] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [table]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<Record<string, any>[]>(`data/${table}/`);
      setRecords(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("List error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setFiltered(records);
      return;
    }

    const lower = search.toLowerCase();

    const result = records.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setFiltered(result);
  }, [search, records]);

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const columns = filtered.length > 0 ? Object.keys(filtered[0]) : [];

  return (
    <div className="space-y-6">

      <PageHeader
        title={table.toUpperCase()}
        subtitle={`Manage ${table} records`}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          + Create
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs uppercase text-gray-500"
                >
                  {col.replace("_", " ")}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-gray-700">
                    {String(row[col])}
                  </td>
                ))}

                <td className="px-4 py-3 text-right space-x-2">
                  <button className="text-blue-600 hover:underline">
                    View
                  </button>
                  <button className="text-gray-500 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            No records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicList;