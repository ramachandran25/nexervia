import { useEffect } from "react";
import DynamicForm from "../../../shared/components/engine/DynamicForm";

interface Props {
  open: boolean;
  title: string;
  table: string | null;
  subtitle?: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function CreateRequestModal({
  open,
  title,
  table,
  subtitle,
  onClose,
  onSubmitted,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-6">
          <DynamicForm
            table={table || ""}
            onCancel={onClose}
            onSubmitted={() => {
              onSubmitted();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

