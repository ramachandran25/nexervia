function FieldRenderer({ field, value, onChange }) {
  switch (field.field_type) {
    case "string":
      return (
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(field.name, e.target.value)}
        />
      );

    case "choice":
      return (
        <select
          value={value || ""}
          onChange={e => onChange(field.name, e.target.value)}
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
