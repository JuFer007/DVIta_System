import { BedDouble, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { habitacionesService, tiposService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion,
  numero: String(h.numeroHabitacion),
  tipo: h.tipoDescripcion || "—",
  tipoId: h.idTipoHabitacion || "",
  estado: h.estado,
  precio: Number(h.precio),
  precioFmt: `S/.${Number(h.precio).toFixed(2)}`,
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
  { id: 1, numero: "101", tipo: "Estándar",  tipoId: 1, estado: "OCUPADA",    precio: 60,  precioFmt: "S/.60.00",  _raw: {} },
  { id: 2, numero: "201", tipo: "Suite",     tipoId: 2, estado: "DISPONIBLE", precio: 120, precioFmt: "S/.120.00", _raw: {} },
];
const DEMO_TIPOS: any[] = [
  { id: 1, descripcion: "Habitación Estándar", precio: 60,  precioFmt: "S/.60.00",  _raw: {} },
  { id: 2, descripcion: "Suite Deluxe",        precio: 120, precioFmt: "S/.120.00", _raw: {} },
];

export default function HabitacionesPage() {
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
    value: t.id,
    label: `${t.descripcion} — S/.${t.precio}/noche`,
  }));

  const fields: ModalField[] = [
    { key: "idTipoHabitacion", label: "Tipo de Habitación", required: true, type: "select", options: tipoOptions },
    { key: "numeroHabitacion", label: "Número",             required: true, type: "number", placeholder: "101" },
    {
      key: "estado", label: "Estado", required: true, type: "select",
      options: [
        { value: "DISPONIBLE",    label: "Disponible" },
        { value: "OCUPADA",       label: "Ocupada" },
        { value: "MANTENIMIENTO", label: "Mantenimiento" },
      ],
    },
    { key: "precio", label: "Precio (S/.)", required: true, type: "number", placeholder: "60.00", hint: "Puede diferir del tipo" },
  ];

  const getFormData = (row: any) =>
    row ? { idTipoHabitacion: row.tipoId, numeroHabitacion: row.numero, estado: row.estado, precio: row.precio } : null;

  const handleSave = async (form: any) => {
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
    }
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
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
          { key: "id",        label: "ID" },
          { key: "numero",    label: "Nº" },
          { key: "tipo",      label: "Tipo" },
          { key: "estado",    label: "Estado", render: (v) => <StatusBadge status={v} /> },
          { key: "precioFmt", label: "Precio" },
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
        description={`¿Eliminar la habitación #${m.deleting?.numero}?`}
        loading={saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
