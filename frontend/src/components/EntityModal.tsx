import { useState } from "react";
interface Field { key: string; label: string; type?: string; }

interface Props {
  open: boolean;
  title: string;
  fields: Field[];
  data: Record<string, any> | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
}

export default function EntityModal({ open, title, fields,
  data, onClose, onSave }: Props) {
  const [form, setForm] = useState(data ?? {});
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center
      justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2>{data ? "Editar" : "Nuevo"} {title}</h2>
        {fields.map(f => (
          <input key={f.key} placeholder={f.label}
            value={form[f.key] ?? ""}
            onChange={e => setForm({...form, [f.key]: e.target.value})} />
        ))}
        <button onClick={() => onSave(form)}>Guardar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
