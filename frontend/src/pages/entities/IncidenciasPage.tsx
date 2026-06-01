import { useState, useMemo } from "react";
import { AlertTriangle, Loader2, Pencil, ArrowRight, CheckCheck, XCircle } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { incidenciasService, clientesService, habitacionesService } from "../../services/api";
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
  cliente: i.cliente ? `${i.cliente.nombre || ""} ${i.cliente.apellidoPaterno || ""}`.trim() : "—",
  clienteId: i.cliente?.idCliente || "",
  habitacion: i.habitacion ? `#${i.habitacion.numeroHabitacion}` : "—",
  habitacionId: i.habitacion?.idHabitacion || "",
  fecha: i.fecha,
  _raw: i,
});

const DEMO_I: any[] = [
  { id: 1, descripcion: "Aire acondicionado no enfría", tipo: "FALLA_EQUIPO", prioridad: "MEDIA", estado: "ABIERTO", cliente: "María López", clienteId: 1, habitacion: "#101", habitacionId: 1, fecha: "2025-07-14", _raw: {} },
];
const DEMO_C: any[] = [{ id: 1, nombre: "María López", _raw: {} }];
const DEMO_H: any[] = [{ id: 1, numero: "101", _raw: {} }];

export default function IncidenciasPage() {
  const crud         = useCrud(incidenciasService, mapIncidencia, DEMO_I);
  const clientesCrud = useCrud(clientesService,    mapCliente,    DEMO_C);
  const habitacionesCrud = useCrud(habitacionesService, mapHabitacion, DEMO_H);
  const { user } = useAuth();
  const toast = useToast();
  const m = useModalState();

  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const sortedData = useMemo(() =>
    [...crud.data].sort((a, b) => (PRIORITY_ORDER[b.prioridad] || 0) - (PRIORITY_ORDER[a.prioridad] || 0)),
    [crud.data]
  );

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
      key: "prioridad", label: "Prioridad", required: true, type: "select",
      options: PRIORIDADES, cols: 1,
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
      prioridad: row.prioridad,
      idCliente: row.clienteId || "",
      idHabitacion: row.habitacionId || "",
    } : { prioridad: "MEDIA", tipoIncidencia: "OTRO" };

  const handleSave = async (form: any) => {
    const payload: any = {
      descripcion: form.descripcion,
      tipo: form.tipoIncidencia,
      prioridad: form.prioridad,
      estado: m.editing ? m.editing.estado : "ABIERTO",
      ...(user?.idEmpleado ? { empleadoRegistra: { idEmpleado: user.idEmpleado } } : {}),
      fecha: new Date().toISOString().split("T")[0],
    };
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
        columns={[
          { key: "descripcion", label: "Descripción", render: (v: string) => <span className="max-w-[260px] inline-block whitespace-pre-wrap break-words">{v}</span> },
          {
            key: "tipo", label: "Tipo",
            render: (v) => TIPOS_INCIDENCIA.find((t) => t.value === v)?.label || v,
          },
          {
            key: "prioridad", label: "Prioridad",
            render: (v) => (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${prioridadColor[v] || ""}`}>
                {PRIORIDADES.find((p) => p.value === v)?.label || v}
              </span>
            ),
          },
          {
            key: "estado", label: "Estado",
            render: (v) => (
              <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${estadoColor[v] || ""}`}>
                {v}
              </span>
            ),
          },
          { key: "cliente", label: "Cliente" },
          { key: "habitacion", label: "Hab." },
          { key: "fecha", label: "Fecha" },
          {
            key: "_acciones", label: "ACCIONES",
            render: (_, row: any) => {
              if (cambiandoEstado === row.id) return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
              return (
                <div className="flex gap-1">
                  <button
                    onClick={() => m.openEdit(row)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${"text-brand-700 bg-brand-100 hover:bg-brand-200"}`}
                  >
                    <Pencil className="w-3.5 h-3.5" /> EDITAR
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "EN_PROCESO")}
                    disabled={row.estado !== "ABIERTO"}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${row.estado === "ABIERTO" ? "text-amber-700 bg-amber-100 hover:bg-amber-200" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> PROCESO
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "RESUELTO")}
                    disabled={row.estado !== "EN_PROCESO"}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${row.estado === "EN_PROCESO" ? "text-green-700 bg-green-100 hover:bg-green-200" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> RESUELTO
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(row, "CERRADO")}
                    disabled={row.estado !== "RESUELTO"}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${row.estado === "RESUELTO" ? "text-neutral-700 bg-neutral-200 hover:bg-neutral-300" : "text-neutral-300 bg-neutral-100 cursor-not-allowed"}`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> CERRAR
                  </button>
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

    </>
  );
}
