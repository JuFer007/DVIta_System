import { useState, useEffect } from "react";
import { Clock, Plus, Pencil, Trash2, Search, CalendarDays, User, ChevronDown, AlertCircle, X, Save, Loader2 } from "lucide-react";
import { useCrud } from "../../hooks/useCrud";
import ConfirmModal from "../../components/ConfirmModal";
import { useModalState } from "../../hooks/useModalState";
import { empleadosService, recepcionistasService } from "../../services/api";

// ─── API service ──────────────────────────────────────────────────────────────
const horariosService = {
  getAll:  () => fetch("/api/horarios").then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  create:  (data: any) => fetch("/api/horarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
  update:  (id: number, data: any) => fetch(`/api/horarios/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
  delete:  (id: number) => fetch(`/api/horarios/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); }),
};

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapRecepcionista = (r: any) => ({
  id: r.idRecepcionista,
  nombre: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  turno: r.turnoTrabajo,
  _raw: r,
});

const mapHorario = (h: any) => ({
  id: h.idHorario,
  recepcionistaId: h.recepcionista?.idRecepcionista || "",
  recepcionista: `${h.recepcionista?.empleado?.nombre || ""} ${h.recepcionista?.empleado?.apellidoP || ""}`.trim() || "—",
  fecha: h.fecha,
  horaInicio: h.horaInicio,
  horaFin: h.horaFin,
  tipoTurno: h.tipoTurno,
  estado: h.estado,
  observaciones: h.observaciones || "",
  _raw: h,
});

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_HORARIOS: any[] = [
  { id: 1, recepcionistaId: 1, recepcionista: "Rosa Condori", fecha: "2026-04-21", horaInicio: "06:00", horaFin: "14:00", tipoTurno: "MAÑANA",   estado: "PROGRAMADO",   observaciones: "" },
  { id: 2, recepcionistaId: 1, recepcionista: "Rosa Condori", fecha: "2026-04-22", horaInicio: "14:00", horaFin: "22:00", tipoTurno: "TARDE",    estado: "PROGRAMADO",   observaciones: "" },
  { id: 3, recepcionistaId: 2, recepcionista: "Pedro Huamán", fecha: "2026-04-21", horaInicio: "22:00", horaFin: "06:00", tipoTurno: "NOCHE",    estado: "EN_CURSO",     observaciones: "Turno nocturno semana 17" },
  { id: 4, recepcionistaId: 2, recepcionista: "Pedro Huamán", fecha: "2026-04-20", horaInicio: "09:00", horaFin: "17:00", tipoTurno: "PERSONALIZADO", estado: "COMPLETADO", observaciones: "Reemplazo por licencia" },
];
const DEMO_RECEP: any[] = [
  { id: 1, nombre: "Rosa Condori",  turno: "MAÑANA", _raw: {} },
  { id: 2, nombre: "Pedro Huamán",  turno: "TARDE",  _raw: {} },
];

// ─── Constantes ───────────────────────────────────────────────────────────────
const TURNO_OPTIONS = [
  { value: "MAÑANA",       label: "Mañana (06:00 – 14:00)" },
  { value: "TARDE",        label: "Tarde (14:00 – 22:00)" },
  { value: "NOCHE",        label: "Noche (22:00 – 06:00)" },
  { value: "PERSONALIZADO", label: "Personalizado" },
];

const ESTADO_OPTIONS = [
  { value: "PROGRAMADO", label: "Programado" },
  { value: "EN_CURSO",   label: "En curso" },
  { value: "COMPLETADO", label: "Completado" },
  { value: "AUSENTE",    label: "Ausente" },
];

const TURNO_COLORS: Record<string, string> = {
  MAÑANA:        "bg-yellow-100 text-yellow-700",
  TARDE:         "bg-orange-100 text-orange-700",
  NOCHE:         "bg-indigo-100 text-indigo-700",
  PERSONALIZADO: "bg-purple-100 text-purple-700",
};

const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADO: "bg-blue-100  text-blue-700",
  EN_CURSO:   "bg-green-100 text-green-700",
  COMPLETADO: "bg-gray-100  text-gray-600",
  AUSENTE:    "bg-red-100   text-red-700",
};

const TURNO_ICONS: Record<string, string> = {
  MAÑANA: "🌅", TARDE: "🌤️", NOCHE: "🌙", PERSONALIZADO: "⚙️",
};

// ─── Modal de Horario ─────────────────────────────────────────────────────────
interface HorarioModalProps {
  open: boolean;
  editing: any | null;
  recepcionistas: any[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function HorarioModal({ open, editing, recepcionistas, loading, error, onClose, onSave }: HorarioModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      if (editing) {
        setForm({
          idRecepcionista: editing.recepcionistaId,
          fecha: editing.fecha,
          tipoTurno: editing.tipoTurno,
          horaInicio: editing.horaInicio,
          horaFin: editing.horaFin,
          estado: editing.estado,
          observaciones: editing.observaciones || "",
        });
      } else {
        setForm({ idRecepcionista: "", fecha: today, tipoTurno: "MAÑANA", horaInicio: "06:00", horaFin: "14:00", estado: "PROGRAMADO", observaciones: "" });
      }
    }
  }, [open, editing]);

  // Auto-fill horas por turno
  useEffect(() => {
    const turno = form.tipoTurno;
    if (turno === "MAÑANA")  { setForm((f: any) => ({ ...f, horaInicio: "06:00", horaFin: "14:00" })); }
    if (turno === "TARDE")   { setForm((f: any) => ({ ...f, horaInicio: "14:00", horaFin: "22:00" })); }
    if (turno === "NOCHE")   { setForm((f: any) => ({ ...f, horaInicio: "22:00", horaFin: "06:00" })); }
  }, [form.tipoTurno]);

  const set = (key: string, val: any) => {
    setForm((f: any) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.idRecepcionista) errs.idRecepcionista = "El recepcionista es obligatorio";
    if (!form.fecha)           errs.fecha = "La fecha es obligatoria";
    if (!form.tipoTurno)       errs.tipoTurno = "El turno es obligatorio";
    if (!form.estado)          errs.estado = "El estado es obligatorio";
    if (form.tipoTurno === "PERSONALIZADO") {
      if (!form.horaInicio) errs.horaInicio = "La hora de inicio es obligatoria";
      if (!form.horaFin)    errs.horaFin = "La hora de fin es obligatoria";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  const inputCls = (key: string) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-[13px] text-neutral-800 outline-none transition-all ${
      fieldErrors[key]
        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-neutral-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-50 hover:border-neutral-300"
    }`;

  const isPersonalizado = form.tipoTurno === "PERSONALIZADO";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
      style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div className="relative w-full max-w-[560px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh", boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(201,169,110,0.12)" }}
      >
        {/* Header */}
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

        {/* Error global */}
        {error && (
          <div className="flex items-center gap-2.5 mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-[12px] text-red-700">{error}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">

            {/* Recepcionista — full width */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Recepcionista <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <select value={form.idRecepcionista || ""} onChange={(e) => set("idRecepcionista", e.target.value)} className={inputCls("idRecepcionista") + " appearance-none pr-9 cursor-pointer"}>
                  <option value="">— Selecciona —</option>
                  {recepcionistas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              {fieldErrors.idRecepcionista && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.idRecepcionista}</p>}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Fecha <span className="text-brand-500">*</span>
              </label>
              <input type="date" value={form.fecha || ""} onChange={(e) => set("fecha", e.target.value)} className={inputCls("fecha")} />
              {fieldErrors.fecha && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.fecha}</p>}
            </div>

            {/* Tipo de turno */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Tipo de Turno <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <select value={form.tipoTurno || ""} onChange={(e) => set("tipoTurno", e.target.value)} className={inputCls("tipoTurno") + " appearance-none pr-9 cursor-pointer"}>
                  {TURNO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Hora inicio */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Hora Inicio {isPersonalizado && <span className="text-brand-500">*</span>}
              </label>
              <input
                type="time" value={form.horaInicio || ""} onChange={(e) => set("horaInicio", e.target.value)}
                disabled={!isPersonalizado}
                className={inputCls("horaInicio") + (!isPersonalizado ? " opacity-50 cursor-not-allowed bg-neutral-50" : "")}
              />
              {fieldErrors.horaInicio && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.horaInicio}</p>}
            </div>

            {/* Hora fin */}
            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Hora Fin {isPersonalizado && <span className="text-brand-500">*</span>}
              </label>
              <input
                type="time" value={form.horaFin || ""} onChange={(e) => set("horaFin", e.target.value)}
                disabled={!isPersonalizado}
                className={inputCls("horaFin") + (!isPersonalizado ? " opacity-50 cursor-not-allowed bg-neutral-50" : "")}
              />
              {fieldErrors.horaFin && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.horaFin}</p>}
            </div>

            {/* Estado */}
            <div className="col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Estado <span className="text-brand-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ESTADO_OPTIONS.map((o) => (
                  <button
                    key={o.value} type="button"
                    onClick={() => set("estado", o.value)}
                    className={`py-2 px-3 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                      form.estado === o.value
                        ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Observaciones */}
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

          {/* Turno preview */}
          {form.tipoTurno && (
            <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-brand-800">
                  Turno {form.tipoTurno} — {form.horaInicio || "?"} a {form.horaFin || "?"}
                </p>
                <p className="text-[11px] text-brand-500">
                  {form.tipoTurno === "PERSONALIZADO"
                    ? "Horario definido manualmente"
                    : "Horario asignado automáticamente por el sistema"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
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
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function HorariosPage() {
  const crud     = useCrud(horariosService, mapHorario, DEMO_HORARIOS);
  const recepCrud = useCrud(recepcionistasService, mapRecepcionista, DEMO_RECEP);
  const m = useModalState();

  const [search, setSearch] = useState("");
  const [filterTurno, setFilterTurno]   = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const filtered = crud.data.filter((h) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || h.recepcionista.toLowerCase().includes(q) || h.fecha.includes(q) || h.tipoTurno.toLowerCase().includes(q);
    const matchesTurno  = !filterTurno  || h.tipoTurno === filterTurno;
    const matchesEstado = !filterEstado || h.estado    === filterEstado;
    return matchesSearch && matchesTurno && matchesEstado;
  });

  // Stats rápidas
  const totalHoy = crud.data.filter(h => h.fecha === new Date().toISOString().split("T")[0]).length;
  const enCurso  = crud.data.filter(h => h.estado === "EN_CURSO").length;
  const programados = crud.data.filter(h => h.estado === "PROGRAMADO").length;

  const handleSave = async (form: any) => {
    const payload: any = {
      recepcionista: { idRecepcionista: Number(form.idRecepcionista) },
      fecha: form.fecha,
      tipoTurno: form.tipoTurno,
      horaInicio: form.horaInicio,
      horaFin:    form.horaFin,
      estado: form.estado,
      observaciones: form.observaciones || null,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
    if (ok) m.closeModal();
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) m.closeDelete();
  };

  return (
    <>
      <div className="flex flex-col gap-5 w-full animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[24px] font-bold text-neutral-900 flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-brand-500" />
              Horarios
            </h1>
            <p className="text-[13px] text-neutral-400 mt-0.5 font-light">
              Gestión de turnos y horarios de recepcionistas
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

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Turnos hoy",     value: totalHoy,    color: "border-t-brand-500  text-brand-600",  bg: "bg-brand-50" },
            { label: "En curso ahora", value: enCurso,     color: "border-t-green-500  text-green-600",  bg: "bg-green-50" },
            { label: "Programados",    value: programados, color: "border-t-blue-500   text-blue-600",   bg: "bg-blue-50" },
          ].map((s) => (
            <div key={s.label} className={`bg-white border border-neutral-200 border-t-2 ${s.color.split(" ")[0]} rounded-sm p-4 shadow-sm`}>
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400 mb-1">{s.label}</p>
              <p className={`font-display text-[28px] font-bold leading-none ${s.color.split(" ")[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabla ── */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-neutral-800 text-[14px]">Todos los horarios</h2>
              <span className="bg-brand-100 text-brand-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{filtered.length}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
                <input
                  className="pl-8 pr-3 py-1.5 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 w-44"
                  placeholder="Buscar…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Filtro turno */}
              <div className="relative">
                <select
                  value={filterTurno}
                  onChange={(e) => setFilterTurno(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Todos los turnos</option>
                  {TURNO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
              {/* Filtro estado */}
              <div className="relative">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-400 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Todos los estados</option>
                  {ESTADO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error */}
          {crud.error && (
            <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 text-yellow-700 text-[12px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> {crud.error}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["ID", "Recepcionista", "Fecha", "Turno", "Horario", "Estado", "Observaciones", "Acciones"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crud.loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-400">Cargando…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-neutral-400">Sin registros</td></tr>
                ) : filtered.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-50 hover:bg-brand-50/50 transition-colors">
                    <td className="px-4 py-3 text-neutral-400 text-[12px] font-mono">{row.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[11px] font-bold flex-shrink-0">
                          {row.recepcionista.charAt(0)}
                        </div>
                        <span className="font-medium text-neutral-800 whitespace-nowrap">{row.recepcionista}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-neutral-300" />
                        {row.fecha}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${TURNO_COLORS[row.tipoTurno] || "bg-gray-100 text-gray-600"}`}>
                        {row.tipoTurno}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-neutral-600 whitespace-nowrap">
                      {row.horaInicio} – {row.horaFin}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${ESTADO_COLORS[row.estado] || "bg-gray-100 text-gray-600"}`}>
                        {row.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-[12px] max-w-[160px] truncate">
                      {row.observaciones || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => m.openEdit(row)} className="p-1.5 text-brand-600 hover:bg-brand-100 rounded transition-colors" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => m.openDelete(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100">
            <span className="text-[11px] text-neutral-400">{filtered.length} registro(s)</span>
          </div>
        </div>
      </div>

      {/* Modales */}
      <HorarioModal
        open={m.modalOpen}
        editing={m.editing}
        recepcionistas={recepCrud.data}
        loading={crud.saving}
        error={crud.saveError}
        onClose={m.closeModal}
        onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen}
        title="horario"
        description={`¿Eliminar el horario del ${m.deleting?.fecha} — ${m.deleting?.recepcionista} (${m.deleting?.tipoTurno})?`}
        loading={crud.saving}
        onClose={m.closeDelete}
        onConfirm={handleDelete}
      />
    </>
  );
}
