import { Crown } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { administradoresService, empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapEmpleado       = (e: any) => ({ id: e.idEmpleado, nombre: e.nombre, apellidoP: e.apellidoP, _raw: e });
const mapAdministrador  = (a: any) => ({
  id: a.idAdministrador,
  empleadoId: a.empleado?.idEmpleado || "",
  empleado: `${a.empleado?.nombre || ""} ${a.empleado?.apellidoP || ""}`.trim() || "—",
  correo: a.correoElectronico, _raw: a,
});

const DEMO_A: any[] = [{ id: 1, empleadoId: 1, empleado: "Pedro Huamán", correo: "pedro.admin@dvita.pe", _raw: {} }];
const DEMO_E: any[] = [{ id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", _raw: {} }];

export default function AdministradoresPage() {
  const crud    = useCrud(administradoresService, mapAdministrador, DEMO_A);
  const empCrud = useCrud(empleadosService,       mapEmpleado,      DEMO_E);
  const m = useModalState();

  const fields: ModalField[] = [
    {
      key: "idEmpleado", label: "Empleado", required: true, type: "select",
      options: empCrud.data.map((e) => ({ value: e.id, label: `${e.nombre} ${e.apellidoP}` })),
      cols: 2,
    },
    { key: "correoElectronico", label: "Correo Electrónico", required: true, type: "email", placeholder: "admin@dvita.pe", cols: 2 },
  ];

  const getFormData = (row: any) =>
    row ? { idEmpleado: row.empleadoId, correoElectronico: row.correo } : null;

  const handleSave = async (form: any) => {
    const payload = { empleado: { idEmpleado: Number(form.idEmpleado) }, correoElectronico: form.correoElectronico };
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
        title="Administradores" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",       label: "ID" },
          { key: "empleado", label: "Empleado" },
          { key: "correo",   label: "Correo" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Administrador" icon={<Crown className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="administrador"
        description={`¿Eliminar al administrador ${m.deleting?.empleado}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
