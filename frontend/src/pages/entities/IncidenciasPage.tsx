import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Loader2, Pencil, ArrowRight, CheckCheck, XCircle, History, RotateCcw, FileText } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { incidenciasService, clientesService, habitacionesService, areasService, downloadPdf } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

const PRIORITY_ORDER: Record<string, number> = { URGENTE: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };

const TIPOS_INCIDENCIA = [
  { value: "DAÑO_HABITACION",   label: "Daño en Habitación" },
  { value: "QUEJA_HUESPED",     label: "Queja de Huésped" },
  { value: "PROBLEMA_SERVICIO", label: "Problema de Servicio" },
  { value: "FALLA_EQUIPO",      label: "Falla de Equipo" },
  { value: "OTRO",              label: "Otro" },
];

const PRIORIDADES = [
  { value: "BAJA",   label: "Baja" },
  { value: "MEDIA",  label: "Media" },
  { value: "ALTA",   label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
];

const ESTADOS_INCIDENCIA = [
  { value: "ABIERTO",  label: "Abierto" },
  { value: "EN_PROCESO", label: "En Proceso" },
  { value: "RESUELTO", label: "Resuelto" },
  { value: "CERRADO",  label: "Cerrado" },
];

const mapArea = (a: any) => ({ value: a.idArea, label: a.nombre });

const mapCliente = (c: any) => ({
  id: c.idCliente,
  nombre: `${c.nombre || ""} ${c.apellidoPaterno || ""}`.trim(),
  _raw: c,
});

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion,
  numero: String(h.numeroHabitacion),
  _raw: h,
});

const mapIncidencia = (i: any) => ({
  id: i.idIncidencia,
  descripcion: i.descripcion,
  tipo: i.tipo,
  prioridad: i.prioridad,
  estado: i.estado,
  areaId: i.area?.idArea || "",
  areaNombre: i.area?.nombre || "",
  cliente: i.cliente ? `${i.cliente.nombre || ""} ${i.cliente.apellidoPaterno || ""}`.trim() : "—",
  clienteId: i.cliente?.idCliente || "",
  habitacion: i.habitacion ? `#${i.habitacion.numeroHabitacion}` : "—",
  habitacionId: i.habitacion?.idHabitacion || "",
  fecha: i.fecha,
  esRecurrente: i.esRecurrente || false,
  vecesResuelta: i.vecesResuelta || 0,
  _raw: i,
});

const DEMO_I: any[] = [
  { id: 1, descripcion: "Aire acondicionado no enfría", tipo: "FALLA_EQUIPO", prioridad: "MEDIA", estado: "ABIERTO", areaId: "", areaNombre: "", cliente: "María López", clienteId: 1, habitacion: "#101", habitacionId: 1, fecha: "2025-07-14", esRecurrente: false, vecesResuelta: 0, _raw: {} },
];
const DEMO_C: any[] = [{ id: 1, nombre: "María López", _raw: {} }];
const DEMO_H: any[] = [{ id: 1, numero: "101", _raw: {} }];
const DEMO_A: any[] = [];

export default function IncidenciasPage() {
  const crud         = useCrud(incidenciasService, mapIncidencia, DEMO_I);
  const clientesCrud = useCrud(clientesService,    mapCliente,    DEMO_C);
  const habitacionesCrud = useCrud(habitacionesService, mapHabitacion, DEMO_H);
  const areasCrud    = useCrud(areasService,        mapArea,       DEMO_A);
  const { user } = useAuth();
  const toast = useToast();
  const m = useModalState();

  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
  const [historialRow, setHistorialRow] = useState<any | null>(null);
  const [historialData, setHistorialData] = useState<any[]>([]);
  const [historialLoading, setHistorialLoading] = useState(false);

  // Resolve dialog state
  const [resolveRow, setResolveRow] = useState<any | null>(null);
  const [resolveSolucion, setResolveSolucion] = useState("");
  const [resolveNotas, setResolveNotas] = useState("");
  const [resolveSending, setResolveSending] = useState(false);

  useEffect(() => {
    if (areasCrud.data.length === 0) areasCrud.refetch();
  }, []);

  const sortedData = useMemo(() =>
    [...crud.data].sort((a, b) => (PRIORITY_ORDER[b.prioridad] || 0) - (PRIORITY_ORDER[a.prioridad] || 0)),
    [crud.data]
  );

  const areaOptions = areasCrud.data.map((a: any) => ({ value: a.id, label: a.label }));

  const fields: ModalField[] = [
    {
      key: "descripcion", label: "Descripción", required: true, type: "textarea",
      placeholder: "Describe la incidencia…", cols: 2,
    },
    {
      key: "tipoIncidencia", label: "Tipo", required: true, type: "select",
      options: TIPOS_INCIDENCIA, cols: 1,
    },
    {
      key: "area", label: "Área", required: true, type: "select",
      options: areaOptions, cols: 1,
    },
    {
      key: "idCliente", label: "Cliente (opcional)", type: "select",
      options: clientesCrud.data.map((c) => ({ value: c.id, label: c.nombre })),
      cols: 1,
    },
    {
      key: "idHabitacion", label: "Habitación (opcional)", type: "select",
      options: habitacionesCrud.data.map((h) => ({ value: h.id, label: h.numero })),
      cols: 1,
    },
  ];

  const getFormData = (row: any) =>
    row ? {
      descripcion: row.descripcion,
      tipoIncidencia: row.tipo,
      area: row.areaId || "",
      idCliente: row.clienteId || "",
      idHabitacion: row.habitacionId || "",
    } : { prioridad: "MEDIA", tipoIncidencia: "OTRO" };

  const handleSave = async (form: any) => {
    const payload: any = {
      descripcion: form.descripcion,
      tipo: form.tipoIncidencia,
      estado: m.editing ? m.editing.estado : "ABIERTO",
      ...(user?.idEmpleado ? { empleadoRegistra: { idEmpleado: user.idEmpleado } } : {}),
      fecha: new Date().toISOString().split("T")[0],
    };
    if (form.area) payload.area = { idArea: Number(form.area) };
    if (form.idCliente) payload.cliente = { idCliente: Number(form.idCliente) };
    if (form.idHabitacion) payload.habitacion = { idHabitacion: Number(form.idHabitacion) };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) {
      toast.showToast("success", m.editing ? "Incidencia actualizada" : "Incidencia creada", form.descripcion);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error", crud.saveError);
    }
  };

  const handleCambiarEstado = async (row: any, estado: string) => {
    if (estado === "RESUELTO") {
      setResolveRow(row);
      setResolveSolucion("");
      setResolveNotas("");
      return;
    }
    setCambiandoEstado(row.id);
    try {
      await incidenciasService.cambiarEstado(row.id, estado);
      toast.showToast("success", "Estado actualizado", `Incidencia #${row.id} → ${estado}`);
      crud.refetch();
    } catch (e: any) {
      toast.showToast("fail", "Error", e?.message || "No se pudo cambiar el estado");
    } finally {
      setCambiandoEstado(null);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolveRow) return;
    setResolveSending(true);
    try {
      await incidenciasService.cambiarEstado(
        resolveRow.id,
        "RESUELTO",
        resolveSolucion,
        resolveNotas,
        user?.idEmpleado
      );
      toast.showToast("success", "Incidencia resuelta", resolveSolucion || "Sin descripción");
      setResolveRow(null);
      crud.refetch();
    } catch (e: any) {
      toast.showToast("fail", "Error", e?.message || "No se pudo resolver la incidencia");
    } finally {
      setResolveSending(false);
    }
  };

  const handleVerHistorial = async (row: any) => {
    setHistorialRow(row);
    setHistorialLoading(true);
    setHistorialData([]);
    try {
      const data = await incidenciasService.getResoluciones(row.id);
      setHistorialData(data);
    } catch {
      setHistorialData([]);
    } finally {
      setHistorialLoading(false);
    }
  };

  const estadoColor: Record<string, string> = {
    ABIERTO:    "bg-red-100 text-red-700",
    EN_PROCESO: "bg-amber-100 text-amber-700",
    RESUELTO:   "bg-green-100 text-green-700",
    CERRADO:    "bg-neutral-100 text-neutral-600",
  };

  const prioridadColor: Record<string, string> = {
    BAJA:    "bg-neutral-100 text-neutral-600",
    MEDIA:   "bg-blue-100 text-blue-700",
    ALTA:    "bg-orange-100 text-orange-700",
    URGENTE: "bg-red-100 text-red-700",
  };

  return (
    <>
      <DataTable
        title="Incidencias" data={sortedData} loading={crud.loading} error={crud.error}
        headerExtra={
          <button onClick={() => downloadPdf("/api/incidencias/pdf/reporte?desde=2020-01-01&hasta=" + new Date().toISOString().split("T")[0], "reporte-incidencias.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF Reporte
          </button>
        }
        columns={[
          { key: "descripcion", label: "Descripción", render: (v: string) => <span className="break-words line-clamp-2 text-[12px]">{v.toUpperCase()}</span> },
          {
            key: "tipo", label: "Tipo",
            render: (v) => (TIPOS_INCIDENCIA.find((t) => t.value === v)?.label || v).toUpperCase(),
          },
          { key: "areaNombre", label: "Área", render: (v) => v?.toUpperCase() },
          {
            key: "prioridad", label: "Prioridad",
            render: (v) => (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${prioridadColor[v] || ""}`}>
                {(PRIORIDADES.find((p) => p.value === v)?.label || v).toUpperCase()}
              </span>
            ),
          },
          {
            key: "estado", label: "Estado",
            render: (v) => (
              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${estadoColor[v] || ""}`}>
                {v.toUpperCase()}
              </span>
            ),
          },
          {
            key: "esRecurrente", label: "Recurrente",
            render: (_, row: any) => row.esRecurrente
              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-700">
                  <RotateCcw className="w-3 h-3" /> ×{row.vecesResuelta || 1}
                </span>
              : "—",
          },
          { key: "cliente", label: "Cliente", render: (v) => v === "—" ? v : v?.toUpperCase() },
          { key: "habitacion", label: "Hab.", render: (v) => v === "—" ? v : v?.toUpperCase() },
          { key: "fecha", label: "Fecha" },
          {
            key: "_acciones", label: "ACCIONES",
            render: (_, row: any) => {
              if (cambiandoEstado === row.id) return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
              return (
                <div className="flex gap-0.5">
                  <button
                    onClick={() => m.openEdit(row)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors text-sky-700 bg-sky-100 hover:bg-sky-200"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "EN_PROCESO")}
                    disabled={row.estado !== "ABIERTO"}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${row.estado === "ABIERTO" ? "text-amber-700 bg-amber-100 hover:bg-amber-200" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                    title="En proceso"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "RESUELTO")}
                    disabled={row.estado !== "EN_PROCESO"}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${row.estado === "EN_PROCESO" ? "text-green-700 bg-green-100 hover:bg-green-200" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                    title="Resuelto"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "CERRADO")}
                    disabled={row.estado !== "RESUELTO"}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${row.estado === "RESUELTO" ? "text-slate-700 bg-slate-200 hover:bg-slate-300" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                    title="Cerrar"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                  {(row.estado === "RESUELTO" || row.estado === "CERRADO") && (
                    <>
                      <button
                        onClick={() => handleVerHistorial(row)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors text-violet-700 bg-violet-100 hover:bg-violet-200"
                        title="Ver historial de resoluciones"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => downloadPdf(`/api/incidencias/pdf/historial/${row.id}`, `historial-incidencia-${row.id}.pdf`)}
                        className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors text-rose-700 bg-rose-100 hover:bg-rose-200"
                        title="Descargar PDF del historial"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            },
          },
        ]}
        onNew={m.openNew}
      />
      <EntityModal
        open={m.modalOpen} title="Incidencia" icon={<AlertTriangle className="w-4 h-4" />}
        fields={fields}         data={m.editing ? getFormData(m.editing) : null}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />

      {/* Resolve Dialog */}
      {resolveRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => { if (!resolveSending) setResolveRow(null); }}>
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 32px 80px rgba(29,13,4,0.35)" }}>
            <div className="flex items-center gap-3 px-6 py-4 bg-green-700">
              <div className="w-9 h-9 rounded-lg bg-green-600/50 flex items-center justify-center text-green-200">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-green-300">Resolver Incidencia</p>
                <h2 className="font-display text-[18px] font-bold text-white leading-tight">#{resolveRow.id}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[13px] text-neutral-600">{resolveRow.descripcion}</p>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  ¿Cómo se solucionó? <span className="text-green-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={resolveSolucion}
                  onChange={e => setResolveSolucion(e.target.value)}
                  placeholder="Describe la solución aplicada…"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  Notas para auditoría (opcional)
                </label>
                <textarea
                  rows={2}
                  value={resolveNotas}
                  onChange={e => setResolveNotas(e.target.value)}
                  placeholder="Ej: factura #1234, autorizado por gerencia…"
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
              <button onClick={() => setResolveRow(null)} disabled={resolveSending}
                className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:border-neutral-300 hover:bg-white transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleConfirmResolve} disabled={!resolveSolucion.trim() || resolveSending}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-[12px] font-bold tracking-[0.08em] uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {resolveSending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</> : <><CheckCheck className="w-4 h-4" /> Resolver</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial Modal */}
      {historialRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
          onClick={() => setHistorialRow(null)}>
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 32px 80px rgba(29,13,4,0.35)" }}>
            <div className="flex items-center gap-3 px-6 py-4 bg-brand-800">
              <div className="w-9 h-9 rounded-lg bg-black/20 flex items-center justify-center text-brand-200">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-brand-300">Historial de Resoluciones</p>
                <h2 className="font-display text-[18px] font-bold text-white leading-tight">#{historialRow.id} — {historialRow.descripcion}</h2>
              </div>
              <button onClick={() => setHistorialRow(null)}
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-brand-400 hover:text-white hover:bg-brand-700 transition-colors flex-shrink-0">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {historialLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              ) : historialData.length === 0 ? (
                <p className="text-center text-neutral-400 py-8 text-[13px]">Sin resoluciones registradas</p>
              ) : (
                <div className="space-y-3">
                  {historialData.map((r: any) => (
                    <div key={r.idResolucion} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-700">
                          V{r.version}
                        </span>
                        <span className="text-[11px] text-neutral-400">{r.fechaResolucion}</span>
                      </div>
                      <p className="text-[13px] text-neutral-700 mb-1">{r.solucion || "Sin descripción"}</p>
                      {r.empleadoResuelve && (
                        <p className="text-[11px] text-neutral-400">
                          Resuelto por: {r.empleadoResuelve.nombre || r.empleadoResuelve.idEmpleado}
                        </p>
                      )}
                      {r.notasAuditoria && (
                        <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
                          <span className="font-bold">Auditoría:</span> {r.notasAuditoria}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
