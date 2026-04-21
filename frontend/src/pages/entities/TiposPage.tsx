import { Bed } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { tiposService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapTipo = (t: any) => ({
  id: t.idTipoHabitacion,
  descripcion: t.descripcion,
  precio: Number(t.precio),
  precioFmt: `S/.${Number(t.precio).toFixed(2)}`,
  _raw: t,
});

const DEMO: any[] = [
  { id: 1, descripcion: "Habitación Estándar", precio: 60,  precioFmt: "S/.60.00",  _raw: {} },
  { id: 2, descripcion: "Suite Deluxe",        precio: 120, precioFmt: "S/.120.00", _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "descripcion", label: "Descripción", required: true, placeholder: "Ej: Suite Deluxe", cols: 2 },
  { key: "precio",      label: "Precio (S/.)", required: true, type: "number", placeholder: "120.00", hint: "Precio base por noche" },
];

export default function TiposPage() {
  const crud = useCrud(tiposService, mapTipo, DEMO);
  const m = useModalState();

  const getFormData = (row: any) =>
    row ? { descripcion: row.descripcion, precio: row.precio } : null;

  const handleSave = async (form: any) => {
    const payload = { descripcion: form.descripcion, precio: parseFloat(form.precio) };
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
        title="Tipos de Habitación" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",          label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { key: "precioFmt",   label: "Precio" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Tipo de Habitación" icon={<Bed className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="tipo de habitación"
        description={`¿Eliminar el tipo "${m.deleting?.descripcion}"?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
