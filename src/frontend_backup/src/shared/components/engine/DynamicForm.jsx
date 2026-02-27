import { useEffect, useState } from "react";
import api from "../../services/api";
import FieldRenderer from "./FieldRenderer";

function DynamicForm({ table }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    api.get(`meta/fields/?table=${table}`)
      .then(res => setFields(res.data));
  }, [table]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await api.post(`data/${table}/`, formData);
  };

  return (
    <div>
      {fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          <FieldRenderer
            field={field}
            value={formData[field.name]}
            onChange={handleChange}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default DynamicForm;
