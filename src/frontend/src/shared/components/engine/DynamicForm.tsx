import { useEffect, useState } from "react";
import api from "../../../services/api";

type Choice = { value: string; label: string };

type MetaField = {
  name: string;
  label?: string;
  field_type: string;
  required?: boolean;
  placeholder?: string;
  choices?: Choice[];
};

export interface DynamicFormProps {
  table: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export default function DynamicForm({ table, onSubmitted, onCancel }: DynamicFormProps) {
  const [fields, setFields] = useState<MetaField[]>([]);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get<MetaField[]>(`meta/fields/?table=${table}`);
        if (!cancelled) {
          setFields(res.data || []);
        }
      } catch {
        if (!cancelled) {
          setFields([]);
          setError("Unable to load form fields. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (table) {
      load();
    } else {
      setFields([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [table]);

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!table) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`data/${table}/`, formData);
      onSubmitted?.();
    } catch {
      setError("Unable to submit request. Please check your entries and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackFields: MetaField[] =
    table === "servex"
      ? [
          {
            name: "short_description",
            label: "Short description",
            field_type: "string",
            required: true,
            placeholder: "Brief summary of your request",
          },
          {
            name: "description",
            label: "Details",
            field_type: "string",
            required: false,
            placeholder: "Add any additional context or information",
          },
        ]
      : [];

  const hasFallback = fallbackFields.length > 0;
  const effectiveFields = fields.length > 0 ? fields : fallbackFields;

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="text-sm text-slate-600">Loading form…</div>
      ) : effectiveFields.length === 0 ? (
        <div className="text-sm text-slate-600">No fields configured for this request type.</div>
      ) : (
        effectiveFields.map((field) => {
          const label = field.label || field.name;
          const commonClassName =
            "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

          return (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {label}
                {field.required ? <span className="text-red-600"> *</span> : null}
              </label>

              {field.field_type === "choice" ? (
                <select
                  value={String(formData[field.name] ?? "")}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={commonClassName}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {(field.choices || []).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={String(formData[field.name] ?? "")}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={commonClassName}
                />
              )}
            </div>
          );
        })
      )}

      {error && !hasFallback ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={submitting}
          >
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-50"
          disabled={loading || submitting || !table}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}

