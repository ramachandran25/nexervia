export default function ContentNavbar() {
  return (
    <div className="h-[56px] bg-white border-b flex items-center justify-between px-6">

      {/* LEFT: Advanced Filters */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-gray-100 rounded-md text-sm">
          Filter
        </button>

        <button className="px-4 py-2 bg-gray-100 rounded-md text-sm">
          Group By
        </button>
      </div>

      {/* RIGHT: UI Actions */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
          New
        </button>

        <button className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm">
          Export
        </button>
      </div>

    </div>
  );
}