interface Props {
  open: boolean;
  record: Record<string, unknown> | null;
  onClose: () => void;
}

export default function RequestDetailsModal({ open, record, onClose }: Props) {
  if (!open) return null;

  const entries = record ? Object.entries(record) : [];
  const sysId = record?.sys_id as string | undefined;
  const number = record?.number as string | undefined;
  const table = record?.table_name as string | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">
              Request {number ? `#${number}` : sysId ? `#${sysId}` : ""}
            </div>
            {table ? (
              <div className="mt-1 text-xs text-slate-500">Request type: {table}</div>
            ) : null}
          </div>  
          <div className="flex gap-2">
            
          <button
            type="button"
            onClick={() => {
              const idForUrl = sysId ?? number;
              const url = new URL(window.location.href);

              url.searchParams.set("view", "requests");
              if (table) {
                url.searchParams.set("table", table);
              }
              url.searchParams.set("detail", "1");
              if (idForUrl) {
                url.searchParams.set("record", String(idForUrl));
              }

              window.open(url.toString(), "_blank");
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Open in new window
          </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>  
        </div>

        <div className="max-h-[520px] overflow-y-auto px-6 py-5">
          {entries.length === 0 ? (
            <div className="text-sm text-slate-600">No data available for this request.</div>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {entries.map(([key, value]) => (
                <div key={key} className="border-b border-slate-100 pb-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="mt-1 text-sm text-slate-800 break-words">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

