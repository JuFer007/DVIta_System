import { Users } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { clientesService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapCliente = (c: any) => ({
  id: c.idCliente,
  nombre: c.nombre,
  apellidoP: c.apellidoPaterno,
  apellidoM: c.apellidoMaterno,
  dni: c.dni,
  telefono: c.telefono,
  email: c.email || "",
  _raw: c,
});

const DEMO: any[] = [
  { id: 1, nombre: "María López", apellidoP: "López", apellidoM: "Ríos", dni: "12345678", telefono: "987654321", email: "maria@gmail.com", _raw: {} },
  { id: 2, nombre: "Carlos Ruiz",  apellidoP: "Ruiz",  apellidoM: "Torres", dni: "23456789", telefono: "976543210", email: "carlos@gmail.com", _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "nombre",          label: "Nombre",          required: true, placeholder: "Ej: María" },
  { key: "apellidoPaterno", label: "Apellido Paterno", required: true, placeholder: "Ej: López" },
  { key: "apellidoMaterno", label: "Apellido Materno", required: true, placeholder: "Ej: Ríos" },
  { key: "dni",             label: "DNI",              required: true, placeholder: "12345678", hint: "8 dígitos" },
  { key: "telefono",        label: "Teléfono",         required: true, placeholder: "987654321", hint: "9-15 dígitos" },
  { key: "email",           label: "Email",            type: "email",  placeholder: "correo@email.com", cols: 2 },
];

export default function ClientesPage() {
  const crud = useCrud(clientesService, mapCliente, DEMO);
  const m = useModalState();

  const getFormData = (row: any) =>
    row
      ? { nombre: row.nombre, apellidoPaterno: row.apellidoP, apellidoMaterno: row.apellidoM, dni: row.dni, telefono: row.telefono, email: row.email || "" }
      : null;

  const handleSave = async (form: any) => {
    const payload = {
      nombre: form.nombre, apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno, dni: form.dni,
      telefono: form.telefono, email: form.email || null,
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
        title="Clientes" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",        label: "ID" },
          { key: "nombre",    label: "Nombre" },
          { key: "apellidoP", label: "Ap. Paterno" },
          { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni",       label: "DNI" },
          { key: "telefono",  label: "Teléfono" },
          { key: "email",     label: "Email" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Cliente" icon={<Users className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="cliente"
        description={`¿Eliminar a ${m.deleting?.nombre} ${m.deleting?.apellidoP}? Esta acción no se puede deshacer.`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
