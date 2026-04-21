import { User } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { usuariosService, empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapEmpleado = (e: any) => ({ id: e.idEmpleado, nombre: e.nombre, apellidoP: e.apellidoP, _raw: e });
const mapUsuario  = (u: any) => ({
  id: u.idUsuario,
  empleadoId: u.empleado?.idEmpleado || "",
  empleado: `${u.empleado?.nombre || ""} ${u.empleado?.apellidoP || ""}`.trim() || "—",
  usuario: u.nombreUsuario, contrasena: "••••••••", _raw: u,
});

const DEMO_U: any[] = [{ id: 1, empleadoId: 1, empleado: "Pedro Huamán", usuario: "pedro.huaman", contrasena: "••••••••", _raw: {} }];
const DEMO_E: any[] = [{ id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", _raw: {} }];

export default function UsuariosPage() {
  const crud    = useCrud(usuariosService,  mapUsuario,  DEMO_U);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_E);
  const m = useModalState();

  const fields: ModalField[] = [
    {
      key: "idEmpleado", label: "Empleado", required: true, type: "select",
      options: empCrud.data.map((e) => ({ value: e.id, label: `${e.nombre} ${e.apellidoP}` })),
      cols: 2,
    },
    { key: "nombreUsuario", label: "Nombre de usuario", required: true,      placeholder: "pedro.huaman", hint: "4-50 caracteres" },
    { key: "contrasena",    label: "Contraseña",        required: !m.editing, type: "password", hint: "Mínimo 8 caracteres", placeholder: m.editing ? "Dejar vacío para no cambiar" : undefined },
  ];

  const getFormData = (row: any) =>
    row ? { idEmpleado: row.empleadoId, nombreUsuario: row.usuario, contrasena: "" } : null;

  const handleSave = async (form: any) => {
    const payload: any = { empleado: { idEmpleado: Number(form.idEmpleado) }, nombreUsuario: form.nombreUsuario };
    if (form.contrasena) payload.contrasena = form.contrasena;
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
        title="Usuarios" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",         label: "ID" },
          { key: "empleado",   label: "Empleado" },
          { key: "usuario",    label: "Usuario" },
          { key: "contrasena", label: "Contraseña" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Usuario" icon={<User className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="usuario"
        description={`¿Eliminar al usuario "${m.deleting?.usuario}"?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
