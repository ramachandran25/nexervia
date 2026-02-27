function FieldRenderer({ field, value, onChange, className }) {
  switch (field.field_type) {
    case "string":
      return (
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(field.name, e.target.value)}
          className={className}
        />
      );

    case "choice":
      return (
        <select
          value={value || ""}
          onChange={e => onChange(field.name, e.target.value)}
          className={className}
        >
          {field.choices.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      );

    default:
      return null;
  }
}

export default FieldRenderer;
