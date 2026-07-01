import { useState, useEffect } from "react";
import { Clock, Plus, Search, ChevronDown, AlertCircle, X, Save, Loader2, Trash2 } from "lucide-react";
import { useCrud } from "../../hooks/useCrud";
import { useModalState } from "../../hooks/useModalState";
import { empleadosService, getAuthToken } from "../../services/api";
import { useToast } from "../../components/Toast";

const authHeaders = (): Record<string, string> => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getAuthToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
};

const horariosService = {
  getAll:  () => fetch("/api/horarios", { headers: authHeaders() }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  create:  (data: any) => fetch("/api/horarios", { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
  update:  (id: number, data: any) => fetch(`/api/horarios/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
  delete:  (id: number) => fetch(`/api/horarios/${id}`, { method: "DELETE", headers: authHeaders() }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); }),
};

const mapEmpleado = (e: any) => ({
  id: e.idEmpleado,
  nombre: `${e.nombre || ""} ${e.apellidoP || ""}`.trim() || "—",
  dni: e.dni || "",
  _raw: e,
});

const mapHorario = (h: any) => ({
  id: h.idHorario,
  empleadoId: h.empleado?.idEmpleado || "",
  empleado: `${h.empleado?.nombre || ""} ${h.empleado?.apellidoP || ""}`.trim() || "—",
  cargo: h.empleado?.cargo || "",
  diaSemana: h.diaSemana,
  horaInicio: h.horaInicio,
  horaFin: h.horaFin,
  tipoTurno: h.tipoTurno,
  estado: h.estado,
  observaciones: h.observaciones || "",
  _raw: h,
});

const DIAS_SEMANA = [
  "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO",
];

const DEMO_HORARIOS: any[] = [
  { id: 1, empleadoId: 5, empleado: "Ana Gonzales", diaSemana: "LUNES",   horaInicio: "06:00", horaFin: "14:00", tipoTurno: "MAÑANA",   estado: "PROGRAMADO",   observaciones: "" },
  { id: 2, empleadoId: 5, empleado: "Ana Gonzales", diaSemana: "MARTES",  horaInicio: "06:00", horaFin: "14:00", tipoTurno: "MAÑANA",   estado: "PROGRAMADO",   observaciones: "" },
  { id: 3, empleadoId: 6, empleado: "Diego Vargas", diaSemana: "LUNES",   horaInicio: "22:00", horaFin: "06:00", tipoTurno: "NOCHE",    estado: "PROGRAMADO",   observaciones: "" },
  { id: 4, empleadoId: 6, empleado: "Diego Vargas", diaSemana: "MARTES",  horaInicio: "14:00", horaFin: "22:00", tipoTurno: "TARDE",     estado: "PROGRAMADO",   observaciones: "" },
];

const TURNO_OPTIONS = [
  { value: "MAÑANA",       label: "Mañana (06:00 – 14:00)" },
  { value: "TARDE",        label: "Tarde (14:00 – 22:00)" },
  { value: "NOCHE",        label: "Noche (22:00 – 06:00)" },
  { value: "PERSONALIZADO", label: "Personalizado" },
];

const TURNO_COLORS: Record<string, string> = {
  MAÑANA:        "bg-yellow-100 text-yellow-700",
  TARDE:         "bg-orange-100 text-orange-700",
  NOCHE:         "bg-indigo-100 text-indigo-700",
  PERSONALIZADO: "bg-purple-100 text-purple-700",
};

interface HorarioModalProps {
  open: boolean;
  editing: any | null;
  empleados: any[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function HorarioModal({ open, editing, empleados, loading, error, onClose, onSave, onDelete }: HorarioModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [empSearch, setEmpSearch] = useState("");

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      if (editing) {
        setForm({
          idEmpleado: editing.empleadoId,
          diaSemana: editing.diaSemana,
          horaInicio: editing.horaInicio,
          horaFin: editing.horaFin,
          tipoTurno: editing.tipoTurno || "PERSONALIZADO",
          observaciones: editing.observaciones || "",
        });
      } else {
        setForm({ idEmpleado: "", diaSemana: "LUNES", horaInicio: "06:00", horaFin: "14:00", tipoTurno: "MAÑANA", observaciones: "" });
      }
    }
  }, [open, editing]);

  useEffect(() => {
    const turno = form.tipoTurno;
    if (turno === "MAÑANA")       { setForm((f: any) => ({ ...f, horaInicio: "06:00", horaFin: "14:00" })); }
    else if (turno === "TARDE")   { setForm((f: any) => ({ ...f, horaInicio: "14:00", horaFin: "22:00" })); }
    else if (turno === "NOCHE")   { setForm((f: any) => ({ ...f, horaInicio: "22:00", horaFin: "06:00" })); }
  }, [form.tipoTurno]);

  const set = (key: string, val: any) => {
    setForm((f: any) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.idEmpleado) errs.idEmpleado = "El empleado es obligatorio";
    if (!form.diaSemana)  errs.diaSemana = "El dia es obligatorio";
    if (!form.horaInicio) errs.horaInicio = "La hora de inicio es obligatoria";
    if (!form.horaFin)    errs.horaFin = "La hora de fin es obligatoria";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!editing) return;
    setSaving(true);
    try { await onDelete(editing.id); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  const inputCls = (key: string) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-[13px] text-neutral-800 outline-none transition-all ${
      fieldErrors[key]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-neutral-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-50 hover:border-neutral-300"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
      style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-[560px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh", boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(201,169,110,0.12)" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 bg-brand-900 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-700/50 flex items-center justify-center text-brand-200 flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-brand-300 mb-0.5">
              {editing ? "Editar" : "Nuevo"}
            </p>
            <h2 className="font-display text-[20px] font-bold text-white leading-tight">Horario</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-400 hover:text-white hover:bg-brand-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-[12px] text-red-700">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">

            <div className="col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Empleado <span className="text-brand-500">*</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <input
                  type="text" placeholder="Buscar por nombre o DNI…"
                  value={empSearch} onChange={(e) => setEmpSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-neutral-200 rounded-lg text-[13px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50"
                />
              </div>
              <div className="relative">
                <select value={form.idEmpleado || ""} onChange={(e) => set("idEmpleado", e.target.value)} className={inputCls("idEmpleado") + " appearance-none pr-9 cursor-pointer"}>
                  <option value="">— Selecciona —</option>
                  {empleados
                    .filter((e) => !empSearch || `${e.nombre} ${e.dni}`.toLowerCase().includes(empSearch.toLowerCase()))
                    .map((e) => <option key={e.id} value={e.id}>{e.nombre?.toUpperCase()} — {e.dni}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              {fieldErrors.idEmpleado && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.idEmpleado}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Dia de Semana <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <select value={form.diaSemana || ""} onChange={(e) => set("diaSemana", e.target.value)} className={inputCls("diaSemana") + " appearance-none pr-9 cursor-pointer"}>
                  <option value="">— Selecciona —</option>
                  {DIAS_SEMANA.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              {fieldErrors.diaSemana && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.diaSemana}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Turno
              </label>
              <div className="relative">
                <select value={form.tipoTurno || ""} onChange={(e) => set("tipoTurno", e.target.value)} className={inputCls("tipoTurno") + " appearance-none pr-9 cursor-pointer"}>
                  <option value="PERSONALIZADO">Manual</option>
                  {TURNO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Hora Inicio <span className="text-brand-500">*</span>
              </label>
              <input
                type="time" value={form.horaInicio || ""} onChange={(e) => set("horaInicio", e.target.value)}
                className={inputCls("horaInicio")}
              />
              {fieldErrors.horaInicio && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.horaInicio}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Hora Fin <span className="text-brand-500">*</span>
              </label>
              <input
                type="time" value={form.horaFin || ""} onChange={(e) => set("horaFin", e.target.value)}
                className={inputCls("horaFin")}
              />
              {fieldErrors.horaFin && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.horaFin}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Observaciones <span className="text-neutral-300 font-normal normal-case">(opcional)</span>
              </label>
              <textarea
                rows={2} value={form.observaciones || ""}
                onChange={(e) => set("observaciones", e.target.value)}
                placeholder="Ej: Reemplazo por licencia, turno especial..."
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 outline-none resize-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-all"
              />
            </div>
          </div>

          {form.diaSemana && form.horaInicio && (
            <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-brand-800">
                  {form.diaSemana} — {form.horaInicio} a {form.horaFin}
                </p>
                <p className="text-[11px] text-brand-500">Horario semanal recurrente</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
          <div>
            {editing && (
              <button onClick={handleDelete} disabled={saving || loading} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold rounded-lg transition-colors disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={saving || loading} className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:border-neutral-300 hover:bg-white transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving || loading} className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.08em] uppercase rounded-lg transition-colors disabled:opacity-50 shadow-sm">
              {saving || loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando…</>
                : <><Save className="w-3.5 h-3.5" />{editing ? "Actualizar" : "Crear"}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HorariosPage() {
  const crud     = useCrud(horariosService, mapHorario, DEMO_HORARIOS);
  const empCrud = useCrud({ getAll: () => empleadosService.getAll() }, mapEmpleado, []);
  const m = useModalState();
  const toast = useToast();

  const [search, setSearch] = useState("");

  const grouped = crud.data.reduce<Record<number, any>>((acc, h) => {
    if (!acc[h.empleadoId]) {
      acc[h.empleadoId] = { empleadoId: h.empleadoId, empleado: h.empleado, cargo: h.cargo, horarios: {} };
    }
    acc[h.empleadoId].horarios[h.diaSemana] = h;
    return acc;
  }, {});

  const filtered = Object.values(grouped).filter((g: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.empleado.toLowerCase().includes(q);
  });

  const conHorario = filtered.length;
  const totalHoras = crud.data.length;

  const handleDelete = async (id: number) => {
    const ok = await crud.remove(id);
    if (ok) {
      toast.showToast("success", "Horario eliminado", "");
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al eliminar", crud.saveError);
    }
  };

  const handleCellDelete = async (h: any) => {
    const ok = await crud.remove(h.id);
    if (ok) {
      toast.showToast("success", "Horario eliminado", "");
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al eliminar", crud.saveError);
    }
  };

  const handleSave = async (form: any) => {
    const payload: any = {
      empleado: { idEmpleado: Number(form.idEmpleado) },
      diaSemana: form.diaSemana,
      tipoTurno: form.tipoTurno === "MANUAL" || form.tipoTurno === "PERSONALIZADO" ? null : form.tipoTurno,
      horaInicio: form.horaInicio,
      horaFin:    form.horaFin,
      estado: "PROGRAMADO",
      observaciones: form.observaciones || null,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
    if (ok) {
      toast.showToast("success", m.editing ? "Horario actualizado" : "Horario creado", `${form.diaSemana} ${form.horaInicio}-${form.horaFin}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 w-full animate-fade-in">

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[24px] font-bold text-neutral-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-brand-500" />
              Horarios
            </h1>
            <p className="text-[13px] text-neutral-400 mt-0.5 font-light">
              Gestión de turnos y horarios del personal
            </p>
          </div>
          <button
            onClick={m.openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[13px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo horario
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Empleados",           value: conHorario, color: "border-t-brand-500  text-brand-600", bg: "bg-brand-50" },
            { label: "Turnos registrados",  value: totalHoras, color: "border-t-blue-500   text-blue-600",  bg: "bg-blue-50" },
            { label: "Cobertura semanal",   value: `${conHorario * 7}`, color: "border-t-green-500  text-green-600", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`bg-white border border-neutral-200 border-t-2 ${s.color.split(" ")[0]} rounded-sm p-4 shadow-sm`}>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400 mb-1">{s.label}</p>
              <p className={`font-display text-[28px] font-bold leading-none ${s.color.split(" ")[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">

          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-neutral-800 text-[14px]">Todos los horarios</h2>
              <span className="bg-brand-100 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                <input
                  className="pl-8 pr-3 py-1.5 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 w-44"
                  placeholder="Buscar…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

            </div>
          </div>

          {crud.error && (
            <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 text-yellow-700 text-[12px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> {crud.error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-neutral-50 z-10">Empleado</th>
                  {DIAS_SEMANA.map(d => (
                    <th key={d} className="px-2 py-2.5 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crud.loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-400">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-400">Sin registros</td></tr>
                ) : filtered.map((g: any) => (
                  <tr key={g.empleadoId} className="border-b border-neutral-50 hover:bg-brand-50/50 transition-colors">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[11px] font-bold flex-shrink-0">
                          {g.empleado.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-800 whitespace-nowrap text-[13px]">{g.empleado?.toUpperCase()}</span>
                          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide">{g.cargo}</span>
                        </div>
                      </div>
                    </td>
                    {DIAS_SEMANA.map((dia) => {
                      const h: any = g.horarios[dia];
                      return (
                        <td key={dia} className="px-1 py-3 text-center">
                          {h ? (
                            <div className="relative group/cell">
                              <button
                                onClick={() => m.openEdit(h)}
                                className="w-full flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                              >
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${TURNO_COLORS[h.tipoTurno] || "bg-gray-100 text-gray-600"}`}>
                                  {h.tipoTurno}
                                </span>
                                <span className="font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                                  {h.horaInicio}–{h.horaFin}
                                </span>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCellDelete(h); }}
                                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white border border-red-200 text-red-500 opacity-0 group-hover/cell:opacity-100 hover:bg-red-50 transition-all shadow-sm"
                                title="Eliminar horario"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-300 text-[11px]">--</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100">
            <span className="text-[11px] text-neutral-400">{filtered.length} empleado(s) con horario</span>
          </div>
        </div>
      </div>

      <HorarioModal
        open={m.modalOpen}
        editing={m.editing}
        empleados={empCrud.data}
        loading={crud.saving || empCrud.loading}
        error={crud.saveError}
        onClose={m.closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
      />

    </>
  );
}
