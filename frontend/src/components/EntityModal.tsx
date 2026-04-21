import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, AlertCircle, ChevronDown } from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "password"
  | "date"
  | "select"
  | "textarea"
  | "readonly";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface ModalField {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];           // para type="select"
  min?: string | number;
  max?: string | number;
  pattern?: string;
  hint?: string;                      // texto de ayuda bajo el campo
  cols?: 1 | 2;                       // span en grid (default 1)
}

export interface EntityModalProps {
  open: boolean;
  title: string;                      // ej: "Cliente"
  icon?: React.ReactNode;
  fields: ModalField[];
  data: Record<string, any> | null;   // null = nuevo
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (data: Record<string, any>) => void | Promise<void>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialForm(
  fields: ModalField[],
  data: Record<string, any> | null
): Record<string, any> {
  const base: Record<string, any> = {};
  for (const f of fields) {
    base[f.key] = data?.[f.key] ?? "";
  }
  return base;
}

// ── Componentes internos ─────────────────────────────────────────────────────

interface FieldProps {
  field: ModalField;
  value: any;
  onChange: (val: any) => void;
  error?: string;
}

function FieldInput({ field, value, onChange, error }: FieldProps) {
  const base =
    "w-full px-3.5 py-2.5 border rounded-lg text-[13px] text-neutral-800 outline-none transition-all " +
    (error
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-neutral-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-50 hover:border-neutral-300");

  if (field.type === "readonly") {
    return (
      <div className="w-full px-3.5 py-2.5 border border-neutral-100 rounded-lg text-[13px] text-neutral-500 bg-neutral-50">
        {value || "—"}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base + " appearance-none cursor-pointer pr-9"}
        >
          <option value="">— Selecciona —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={base + " resize-none"}
      />
    );
  }

  if (field.type === "password") {
    return <PasswordField field={field} value={value} onChange={onChange} error={error} base={base} />;
  }

  return (
    <input
      type={field.type || "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      min={field.min as string}
      max={field.max as string}
      pattern={field.pattern}
      className={base}
    />
  );
}

function PasswordField({
  field,
  value,
  onChange,
  error,
  base,
}: FieldProps & { base: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || "••••••••"}
        className={base + " pr-10"}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-500 transition-colors text-[11px] font-semibold"
      >
        {show ? "Ocultar" : "Ver"}
      </button>
    </div>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────

export default function EntityModal({
  open,
  title,
  icon,
  fields,
  data,
  loading = false,
  error,
  onClose,
  onSave,
}: EntityModalProps) {
  const isEdit = data !== null;
  const [form, setForm] = useState<Record<string, any>>(() =>
    buildInitialForm(fields, data)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Re-inicializar cuando cambie data o se abra el modal
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(fields, data));
      setFieldErrors({});
    }
  }, [open, data]);

  if (!open) return null;

  const set = (key: string, val: any) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const f of fields) {
      if (f.required && !form[f.key]?.toString().trim()) {
        errs[f.key] = `${f.label} es obligatorio`;
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const hasHalfCols = fields.some((f) => f.cols === 2);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,8,2,0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          maxWidth: hasHalfCols ? "640px" : "480px",
          maxHeight: "90vh",
          boxShadow:
            "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(201,169,110,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 bg-brand-900 flex-shrink-0">
          {icon && (
            <div className="w-9 h-9 rounded-lg bg-brand-700/50 flex items-center justify-center text-brand-200 flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-brand-300 mb-0.5">
              {isEdit ? "Editar" : "Nuevo"}
            </p>
            <h2 className="font-display text-[20px] font-bold text-white leading-tight truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-400 hover:text-white hover:bg-brand-700 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error global */}
        {error && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-[12px] text-red-700">{error}</p>
          </div>
        )}

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div
            className={`grid gap-x-4 gap-y-4 ${
              hasHalfCols ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.cols === 2 ? "col-span-2" : "col-span-1"}
              >
                <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-brand-500 ml-1">*</span>
                  )}
                </label>
                <FieldInput
                  field={field}
                  value={form[field.key] ?? ""}
                  onChange={(val) => set(field.key, val)}
                  error={fieldErrors[field.key]}
                />
                {fieldErrors[field.key] && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors[field.key]}
                  </p>
                )}
                {field.hint && !fieldErrors[field.key] && (
                  <p className="text-[11px] text-neutral-400 mt-1">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving || loading}
            className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:border-neutral-300 hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.08em] uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving || loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {isEdit ? "Actualizar" : "Crear"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
