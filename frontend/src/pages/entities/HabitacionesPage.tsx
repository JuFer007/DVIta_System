import { useState } from "react";
import { BedDouble, Pencil, Wrench, CheckCircle, Loader2, Sparkles, FileText } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { habitacionesService, tiposService, downloadPdf, BASE_URL } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion,
  numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || " ",
  tipoId: h.tipoHabitacion?.idTipoHabitacion || "",
  estado: h.estado,
  precio: h.tipoHabitacion?.precio ?? 0,
  precioFmt: `S/.${Number(h.tipoHabitacion?.precio ?? 0).toFixed(2)}`,
  _raw: h,
});

const mapTipo = (t: any) => ({
  id: t.idTipoHabitacion,
  descripcion: t.descripcion,
  precio: Number(t.precio),
  precioFmt: `S/.${Number(t.precio).toFixed(2)}`,
  _raw: t,
});

const DEMO_HAB: any[] = [
  { id: 1, numero: "101", tipo: "INDIVIDUAL", tipoId: 1, estado: "OCUPADA",    precio: 50,  precioFmt: "S/.50.00",  _raw: {} },
  { id: 2, numero: "102", tipo: "DOBLE",      tipoId: 2, estado: "DISPONIBLE", precio: 75.50, precioFmt: "S/.75.50", _raw: {} },
  { id: 3, numero: "103", tipo: "INDIVIDUAL", tipoId: 1, estado: "EN_LIMPIEZA", precio: 50,  precioFmt: "S/.50.00", _raw: {} },
];
const DEMO_TIPOS: any[] = [
  { id: 1, descripcion: "INDIVIDUAL", precio: 50,  precioFmt: "S/.50.00",  _raw: {} },
  { id: 2, descripcion: "DOBLE",      precio: 75.50, precioFmt: "S/.75.50", _raw: {} },
];

export default function HabitacionesPage() {
  const crud      = useCrud(habitacionesService, mapHabitacion, DEMO_HAB);
  const tiposCrud = useCrud(tiposService, mapTipo, DEMO_TIPOS);
  const toast     = useToast();
  const m = useModalState();
  const { puedeEditar } = useAuth();
  const puedeEscribir = puedeEditar("HABITACIONES");

  const [cambiando, setCambiando] = useState<number | null>(null);

  const tipoOptions = tiposCrud.data.map((t) => ({
    value: t.id,
    label: `${t.descripcion} — S/.${t.precio}/noche`,
  }));

  const sinTipos = tipoOptions.length === 0;

  const fields: ModalField[] = [
    {
      key: "idTipoHabitacion", label: "Tipo de Habitación", required: true,
      type: "select", options: tipoOptions, cols: 2,
      hint: sinTipos ? "No hay tipos registrados — crea uno primero en la sección Tipos" : undefined,
    },
    {
      key: "numeroHabitacion", label: "N\u00famero", required: true, type: "number",
      placeholder: "101", min: 1, hint: "N\u00famero entero positivo \u00fanico",
    },
  ];

  const getFormData = (row: any) =>
    row ? { idTipoHabitacion: row.tipoId, numeroHabitacion: row.numero } : { estado: "DISPONIBLE" };

  const handleSave = async (form: any) => {
    const num = Number(form.numeroHabitacion);
    if (!Number.isInteger(num) || num <= 0) {
      toast.showToast("fail", "Validación", "El número de habitación debe ser un entero positivo");
      return;
    }
    if (!form.idTipoHabitacion) {
      toast.showToast("fail", "Validación", "Debes seleccionar un tipo de habitación");
      return;
    }
    const payload: any = {
      tipoHabitacion: { idTipoHabitacion: Number(form.idTipoHabitacion) },
      numeroHabitacion: num,
      estado: m.editing ? m.editing.estado : "DISPONIBLE",
    };
    const esNuevo = !m.editing;
    const ok = esNuevo ? await crud.create(payload) : await crud.update(m.editing.id, payload);
    if (ok) {
      const tipoLabel = tipoOptions.find((t) => t.value === Number(form.idTipoHabitacion))?.label ?? "";
      toast.showToast("success",
        esNuevo ? "Habitación creada" : "Habitación actualizada",
        `#${num} — ${tipoLabel}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError || "Ocurrió un error inesperado");
    }
  };

  const handleCambiarEstado = async (row: any, nuevoEstado: string) => {
    setCambiando(row.id);
    try {
      await habitacionesService.cambiarEstado(row.id, nuevoEstado);
      const msgs: Record<string, string> = {
        DISPONIBLE:   `Habitación #${row.numero} — ahora está disponible`,
        MANTENIMIENTO: `Habitación #${row.numero} puesta en mantenimiento`,
        EN_LIMPIEZA:   `Limpieza asignada a habitación #${row.numero}`,
      };
      toast.showToast("success", "Estado actualizado", msgs[nuevoEstado] || `Habitación #${row.numero} — ${nuevoEstado}`);
      crud.refetch();
    } catch (e: any) {
      const msg = e?.message || "No se pudo cambiar el estado de la habitación";
      toast.showToast("fail", "Error", msg);
    } finally {
      setCambiando(null);
    }
  };

  const estadoColor: Record<string, string> = {
    DISPONIBLE:    "bg-green-100 text-green-700",
    OCUPADA:       "bg-amber-100 text-amber-700",
    MANTENIMIENTO: "bg-neutral-200 text-neutral-600",
    EN_LIMPIEZA:   "bg-blue-100 text-blue-700",
  };

  return (
    <>
      <DataTable
        title="Habitaciones" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "numero", label: "NÚMERO" },
          { key: "tipo",   label: "Tipo" },
          {
            key: "estado", label: "Estado",
            render: (v) => {
              const labels: Record<string, string> = {
                DISPONIBLE: "LIBRE", OCUPADA: "OCUPADA",
                MANTENIMIENTO: "MANTENIMIENTO", EN_LIMPIEZA: "EN LIMPIEZA",
              };
              return (
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${estadoColor[v] || ""}`}>
                  {labels[v] || v}
                </span>
              );
            },
          },
          { key: "precioFmt", label: "Precio" },
          ...(puedeEscribir ? [{
            key: "_acciones", label: "ACCIONES",
            render: (_: any, row: any) => {
              if (cambiando === row.id) return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
              return (
                <div className="flex gap-1">
                  <button onClick={() => m.openEdit(row)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> EDITAR
                  </button>
                  {row.estado === "DISPONIBLE" && (
                    <button onClick={() => handleCambiarEstado(row, "EN_LIMPIEZA")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> LIMPIEZA
                    </button>
                  )}
                  {row.estado === "EN_LIMPIEZA" && (
                    <button onClick={() => handleCambiarEstado(row, "DISPONIBLE")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> LISTO
                    </button>
                  )}
                  {row.estado === "DISPONIBLE" && (
                    <button onClick={() => handleCambiarEstado(row, "MANTENIMIENTO")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors">
                      <Wrench className="w-3.5 h-3.5" /> MANT.
                    </button>
                  )}
                  {row.estado === "MANTENIMIENTO" && (
                    <button onClick={() => handleCambiarEstado(row, "DISPONIBLE")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> HABILITAR
                    </button>
                  )}
                </div>
              );
            },
          }] : [{
            key: "_acciones", label: "ACCIONES",
            render: (_: any, row: any) => {
              if (cambiando === row.id) return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
              return (
                <div className="flex gap-1">
                  {row.estado === "DISPONIBLE" && (
                    <button onClick={() => handleCambiarEstado(row, "EN_LIMPIEZA")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
                      <Sparkles className="w-3.5 h-3.5" /> LIMPIEZA
                    </button>
                  )}
                  {row.estado === "EN_LIMPIEZA" && (
                    <button onClick={() => handleCambiarEstado(row, "DISPONIBLE")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> LISTO
                    </button>
                  )}
                  {row.estado === "DISPONIBLE" && (
                    <button onClick={() => handleCambiarEstado(row, "MANTENIMIENTO")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors">
                      <Wrench className="w-3.5 h-3.5" /> MANT.
                    </button>
                  )}
                  {row.estado === "MANTENIMIENTO" && (
                    <button onClick={() => handleCambiarEstado(row, "DISPONIBLE")}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> HABILITAR
                    </button>
                  )}
                </div>
              );
            },
          }]),
        ]}
        onNew={puedeEscribir ? m.openNew : undefined}
        headerExtra={
          <button onClick={() => downloadPdf(`${BASE_URL}/habitaciones/pdf/reporte`, "habitaciones.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF General
          </button>
        }
      />
      <EntityModal
        open={m.modalOpen} title="Habitación" icon={<BedDouble className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      
    </>
  );
}