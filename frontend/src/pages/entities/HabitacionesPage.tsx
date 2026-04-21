import { BedDouble } from "lucide-react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { habitacionesService, tiposService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion,
  numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || "—",
  tipoId: h.tipoHabitacion?.idTipoHabitacion || "",
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
  const crud      = useCrud(habitacionesService, mapHabitacion, DEMO_HAB);
  const tiposCrud = useCrud(tiposService, mapTipo, DEMO_TIPOS);
  const m = useModalState();

  const tipoOptions = tiposCrud.data.map((t) => ({
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
      tipoHabitacion: { idTipoHabitacion: Number(form.idTipoHabitacion) },
      numeroHabitacion: Number(form.numeroHabitacion),
      estado: form.estado,
      precio: parseFloat(form.precio),
    };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) m.closeModal();
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) m.closeDelete();
  };

  return (
    <>
      <DataTable
        title="Habitaciones" data={crud.data} loading={crud.loading} error={crud.error}
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
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="habitación"
        description={`¿Eliminar la habitación #${m.deleting?.numero}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
