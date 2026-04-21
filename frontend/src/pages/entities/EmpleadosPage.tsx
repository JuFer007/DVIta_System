import { BriefcaseBusiness } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapEmpleado = (e: any) => ({
  id: e.idEmpleado,
  nombre: e.nombre,
  apellidoP: e.apellidoP,
  apellidoM: e.apellidoM,
  dni: e.dni,
  telefono: e.telefono,
  _raw: e,
});

const DEMO: any[] = [
  { id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", apellidoM: "García", dni: "11223344", telefono: "912345678", _raw: {} },
  { id: 2, nombre: "Rosa Condori", apellidoP: "Condori", apellidoM: "Lima",   dni: "22334455", telefono: "923456789", _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "nombre",    label: "Nombre",          required: true, placeholder: "Ej: Pedro" },
  { key: "apellidoP", label: "Apellido Paterno", required: true, placeholder: "Ej: Huamán" },
  { key: "apellidoM", label: "Apellido Materno", required: true, placeholder: "Ej: García" },
  { key: "dni",       label: "DNI",              required: true, placeholder: "12345678", hint: "8 dígitos exactos" },
  { key: "telefono",  label: "Teléfono",         required: true, placeholder: "912345678" },
];

export default function EmpleadosPage() {
  const crud = useCrud(empleadosService, mapEmpleado, DEMO);
  const m = useModalState();

  const getFormData = (row: any) =>
    row ? { nombre: row.nombre, apellidoP: row.apellidoP, apellidoM: row.apellidoM, dni: row.dni, telefono: row.telefono } : null;

  const handleSave = async (form: any) => {
    const payload = { nombre: form.nombre, apellidoP: form.apellidoP, apellidoM: form.apellidoM, dni: form.dni, telefono: form.telefono };
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
        title="Empleados" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",        label: "ID" },
          { key: "nombre",    label: "Nombre" },
          { key: "apellidoP", label: "Ap. Paterno" },
          { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni",       label: "DNI" },
          { key: "telefono",  label: "Teléfono" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Empleado" icon={<BriefcaseBusiness className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="empleado"
        description={`¿Eliminar al empleado ${m.deleting?.nombre} ${m.deleting?.apellidoP}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
