<<<<<<< HEAD
import { BedDouble, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
=======
import { useState } from "react";
import { BedDouble, Wrench, CheckCircle, Loader2 } from "lucide-react";
>>>>>>> main
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { habitacionesService, tiposService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion,
  numero: String(h.numeroHabitacion),
  tipo: h.tipoDescripcion || "—",
  tipoId: h.idTipoHabitacion || "",
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
];
const DEMO_TIPOS: any[] = [
  { id: 1, descripcion: "INDIVIDUAL", precio: 50,  precioFmt: "S/.50.00",  _raw: {} },
  { id: 2, descripcion: "DOBLE",      precio: 75.50, precioFmt: "S/.75.50", _raw: {} },
];

export default function HabitacionesPage() {
<<<<<<< HEAD
  const [data, setData] = useState<any[]>(DEMO_HAB);
  const [tiposData, setTiposData] = useState<any[]>(DEMO_TIPOS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const m = useModalState();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await habitacionesService.getAll(0, 100, "numeroHabitacion", "asc");
      setData(response.content.map(mapHabitacion));
    } catch (e) {
      setError("No se pudo conectar con el servidor. Mostrando datos demo.");
      setData(DEMO_HAB);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await tiposService.getAll();
      setTiposData(response.map(mapTipo));
    } catch (e) {
      setTiposData(DEMO_TIPOS);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTipos();
  }, []);

  const tipoOptions = tiposData.map((t) => ({
=======
  const crud      = useCrud(habitacionesService, mapHabitacion, DEMO_HAB);
  const tiposCrud = useCrud(tiposService, mapTipo, DEMO_TIPOS);
  const toast     = useToast();
  const m = useModalState();

  const [cambiando, setCambiando] = useState<number | null>(null);

  const tipoOptions = tiposCrud.data.map((t) => ({
>>>>>>> main
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
      key: "numeroHabitacion", label: "Número", required: true, type: "number",
      placeholder: "101", hint: "Número entero positivo único",
    },
  ];

  const getFormData = (row: any) =>
    row ? { idTipoHabitacion: row.tipoId, numeroHabitacion: row.numero } : { estado: "DISPONIBLE" };

  const handleSave = async (form: any) => {
<<<<<<< HEAD
    const payload = {
      idTipoHabitacion: Number(form.idTipoHabitacion),
      numeroHabitacion: Number(form.numeroHabitacion),
      estado: form.estado,
      precio: parseFloat(form.precio),
    };
    setSaving(true);
    setSaveError(null);
    try {
      if (m.editing) {
        await habitacionesService.update(m.editing.id, payload);
      } else {
        await habitacionesService.create(payload);
      }
      await fetchData();
      m.closeModal();
    } catch (e: any) {
      const errorMessage = e?.message || "Error al guardar la habitación";
      setSaveError(errorMessage);
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setSaving(false);
=======
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
>>>>>>> main
    }
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
<<<<<<< HEAD
    setSaving(true);
    setSaveError(null);
    try {
      await habitacionesService.delete(m.deleting.id);
      await fetchData();
      m.closeDelete();
    } catch (e: any) {
      const errorMessage = e?.message || "Error al eliminar la habitación";
      setSaveError(errorMessage);
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setSaving(false);
    }
=======
    const ok = await crud.remove(m.deleting.id);
    if (ok) {
      toast.showToast("success", "Habitación eliminada",
        `Habitación #${m.deleting.numero} eliminada correctamente`);
      m.closeDelete();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al eliminar", crud.saveError);
    }
  };

  const handleCambiarEstado = async (row: any, nuevoEstado: string) => {
    setCambiando(row.id);
    try {
      await habitacionesService.cambiarEstado(row.id, nuevoEstado);
      const msg = nuevoEstado === "DISPONIBLE"
        ? `Habitación #${row.numero} habilitada — ahora está disponible`
        : `Habitación #${row.numero} puesta en mantenimiento`;
      toast.showToast("success", "Estado actualizado", msg);
      crud.refetch();
    } catch (e: any) {
      const msg = e?.message || "No se pudo cambiar el estado de la habitación";
      toast.showToast("fail", "Error", msg);
    } finally {
      setCambiando(null);
    }
  };

  const estadoColor: Record<string, string> = {
    DISPONIBLE:   "bg-green-100 text-green-700",
    OCUPADA:      "bg-amber-100 text-amber-700",
    MANTENIMIENTO: "bg-neutral-200 text-neutral-600",
>>>>>>> main
  };

  return (
    <>
      {showAlert && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-lg animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{alertMessage}</p>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-2 text-red-400 hover:text-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      <DataTable
        title="Habitaciones" data={data} loading={loading} error={error}
        columns={[
          { key: "numero",    label: "Nº" },
          { key: "tipo",      label: "Tipo" },
          {
            key: "estado",    label: "Estado",
            render: (v) => {
              const labels: Record<string, string> = { DISPONIBLE: "LIBRE", OCUPADA: "OCUPADA", MANTENIMIENTO: "MANTENIMIENTO" };
              return (
                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${estadoColor[v] || ""}`}>
                  {labels[v] || v}
                </span>
              );
            },
          },
          { key: "precioFmt", label: "Precio" },
          {
            key: "_acciones", label: "",
            render: (_, row: any) => {
              if (cambiando === row.id) {
                return <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />;
              }
              if (row.estado === "DISPONIBLE") {
                return (
                  <button onClick={() => handleCambiarEstado(row, "MANTENIMIENTO")}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    title="Poner en mantenimiento">
                    <Wrench className="w-3 h-3" /> MANTENIMIENTO
                  </button>
                );
              }
              if (row.estado === "MANTENIMIENTO") {
                return (
                  <button onClick={() => handleCambiarEstado(row, "DISPONIBLE")}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    title="Habilitar habitación">
                    <CheckCircle className="w-3 h-3" /> DISPONIBLE
                  </button>
                );
              }
              return null;
            },
          },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Habitación" icon={<BedDouble className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={saving} error={saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="habitación"
<<<<<<< HEAD
        description={`¿Eliminar la habitación #${m.deleting?.numero}?`}
        loading={saving} onClose={m.closeDelete} onConfirm={handleDelete}
=======
        description={`¿Eliminar la habitación #${m.deleting?.numero}? Esta acción no se puede deshacer.`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
>>>>>>> main
      />
    </>
  );
}
