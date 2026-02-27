import { useEffect, useState } from "react";
import api from "../../services/api";
import FieldRenderer from "./FieldRenderer";

function DynamicForm({ table, onSubmitted, onCancel }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`meta/fields/?table=${table}`);
        if (cancelled) return;
        setFields(res.data || []);
      } catch (e) {
        if (cancelled) return;
        setFields([]);
        setError("Unable to load form fields. Please try again.");
      } finally {
        if (cancelled) return;
        setLoading(false);
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

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!table) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post(`data/${table}/`, formData);
      onSubmitted?.();
    } catch (e) {
      setError("Unable to submit request. Please check your entries and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="text-sm text-slate-600">Loading form…</div>
      ) : fields.length === 0 ? (
        <div className="text-sm text-slate-600">
          No fields configured for this request type.
        </div>
      ) : (
        fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {field.label || field.name}
            </label>
            <FieldRenderer
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        ))
      )}

      {error ? (
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

export default DynamicForm;
