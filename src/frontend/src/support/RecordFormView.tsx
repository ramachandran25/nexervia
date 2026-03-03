import type { FormFieldConfig, ServexRecord, TableConfig } from "@/types/support";

export interface RecordFormViewProps<TRecord extends { id: string } = ServexRecord> {
  tableConfig: TableConfig;
  record: TRecord | null;
  loading?: boolean;
  errorMessage?: string;
  isDirty?: boolean;

  onFieldChange?: (fieldName: string, value: unknown) => void;

  onSaveClick?: () => void;
  onUpdateClick?: () => void;
  onCloseClick?: () => void;
  onDeleteClick?: () => void;
  onMoreActionsClick?: () => void;
}

function getFieldDisplayValue(record: Record<string, unknown> | null, field: FormFieldConfig): string {
  if (!record) return "";

  const raw = record[field.name];
  if (raw == null) return "";

  if (raw instanceof Date) {
    return raw.toLocaleString();
  }

  if (typeof raw === "string") {
    // Heuristic: format common ISO datetime strings nicely
    if (field.type === "datetime" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) {
      const date = new Date(raw);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return raw;
  }

  if (typeof raw === "number" || typeof raw === "boolean") {
    return String(raw);
  }

  return "";
}

function getStatusPillClasses(status?: string): string {
  if (!status) {
    return "bg-gray-100 text-gray-700";
  }

  const normalized = status.toLowerCase();

  if (normalized.includes("open") || normalized.includes("new")) {
    return "bg-blue-100 text-blue-800";
  }

  if (normalized.includes("progress") || normalized.includes("pending")) {
    return "bg-amber-100 text-amber-800";
  }

  if (normalized.includes("resolved") || normalized.includes("complete")) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (normalized.includes("closed") || normalized.includes("canceled") || normalized.includes("cancelled")) {
    return "bg-gray-200 text-gray-800";
  }

  if (normalized.includes("critical") || normalized.includes("p1")) {
    return "bg-red-100 text-red-800";
  }

  return "bg-gray-100 text-gray-800";
}

export function RecordFormView<TRecord extends { id: string } = ServexRecord>({
  tableConfig,
  record,
  loading,
  errorMessage,
  isDirty,
  onFieldChange,
  onSaveClick,
  onUpdateClick,
  onCloseClick,
  onDeleteClick,
  onMoreActionsClick,
}: RecordFormViewProps<TRecord>) {
  const primaryFieldKey = tableConfig.form.primaryField;
  const primaryTitle = record ? (record as Record<string, unknown>)[primaryFieldKey] : undefined;
  const ticketNumber = record ? (record as Record<string, unknown>).number : undefined;
  const status = record ? (record as Record<string, unknown>).status : undefined;
  const priority = record ? (record as Record<string, unknown>).priority : undefined;
  const updatedAt = record ? (record as Record<string, unknown>).updatedAt : undefined;

  const hasActions = Boolean(onSaveClick || onUpdateClick || onCloseClick || onDeleteClick || onMoreActionsClick);

  return (
    <div className="flex flex-col h-full">
      {/* Header: breadcrumb-ish context + primary title + key pills */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-gray-500 mb-1">
              Service Requests / {tableConfig.name}
              {ticketNumber ? (
                <>
                  {" "}
                  / <span className="text-gray-700">{String(ticketNumber)}</span>
                </>
              ) : null}
            </div>
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {primaryTitle ? String(primaryTitle) : loading ? "Loading record…" : "New record"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
              {ticketNumber && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-gray-300 bg-white font-medium text-gray-800">
                  {String(ticketNumber)}
                </span>
              )}
              {status && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusPillClasses(
                    String(status)
                  )}`}
                >
                  {String(status)}
                </span>
              )}
              {priority && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-medium">
                  {String(priority)}
                </span>
              )}
              {updatedAt && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500">
                  Last updated{" "}
                  <span className="ml-1 font-medium text-gray-700">
                    {getFieldDisplayValue(record as Record<string, unknown>, {
                      name: "updatedAt",
                      label: "",
                      type: "datetime",
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>

          {hasActions && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {onMoreActionsClick && (
                <button
                  type="button"
                  onClick={onMoreActionsClick}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  More
                </button>
              )}
              {onDeleteClick && (
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              )}
              {onCloseClick && (
                <button
                  type="button"
                  onClick={onCloseClick}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              )}
              {onUpdateClick && (
                <button
                  type="button"
                  onClick={onUpdateClick}
                  disabled={!isDirty}
                  className="px-3 py-1.5 rounded-md border border-blue-600 text-xs font-medium text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              )}
              {onSaveClick && (
                <button
                  type="button"
                  onClick={onSaveClick}
                  disabled={!isDirty}
                  className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              )}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white px-4 py-4">
        {loading && !record && (
          <div className="text-xs text-gray-500">Loading record…</div>
        )}

        {!loading && !record && !errorMessage && (
          <div className="text-xs text-gray-500">No record selected.</div>
        )}

        {record && (
          <div className="space-y-8">
            {tableConfig.form.sections.map((section) => (
              <section key={section.id}>
                <div className="mb-3">
                  <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-1 text-[11px] text-gray-500 max-w-2xl">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => {
                    const value = getFieldDisplayValue(record as Record<string, unknown>, field);
                    const isReadOnly = field.readOnly || field.type === "readonly";
                    const colSpanClass = field.colSpan === 2 ? "md:col-span-2" : "";

                    const baseInputClasses =
                      "mt-1 block w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
                    const readOnlyClasses =
                      "bg-gray-50 text-gray-600 border-gray-200 cursor-default";

                    const handleChange = (nextValue: string) => {
                      if (!onFieldChange || isReadOnly) return;
                      onFieldChange(field.name, nextValue);
                    };

                    return (
                      <div key={field.name} className={colSpanClass}>
                        <label className="block text-xs font-medium text-gray-700">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>

                        {/* Field control */}
                        {field.type === "textarea" ? (
                          <textarea
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={field.placeholder}
                            readOnly={isReadOnly}
                            className={`${baseInputClasses} h-24 resize-y ${
                              isReadOnly ? readOnlyClasses : ""
                            }`}
                          />
                        ) : field.type === "select" || field.type === "choice" ? (
                          <select
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            disabled={isReadOnly}
                            className={`${baseInputClasses} ${
                              isReadOnly ? readOnlyClasses : ""
                            } bg-white`}
                          >
                            <option value="">{field.placeholder ?? "Select…"}</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === "datetime" ? "datetime-local" : "text"}
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            placeholder={
                              field.placeholder ??
                              (field.type === "reference"
                                ? "Search or select…"
                                : field.type === "tags"
                                  ? "Add tags separated by commas"
                                  : "")
                            }
                            readOnly={isReadOnly}
                            className={`${baseInputClasses} ${
                              isReadOnly ? readOnlyClasses : ""
                            }`}
                          />
                        )}

                        {field.helpText && (
                          <p className="mt-1 text-[11px] text-gray-500">{field.helpText}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

