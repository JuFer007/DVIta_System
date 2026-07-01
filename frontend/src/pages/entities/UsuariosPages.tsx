import { useState } from "react";
import { User, Shield, Pencil, Lock, Unlock } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { usuariosService, empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";
import PermisosModal from "./PermisosModal";

const mapEmpleado = (e: any) => ({ id: e.idEmpleado, nombre: e.nombre, apellidoP: e.apellidoP, _raw: e });
const mapUsuario  = (u: any) => ({
  id: u.idUsuario,
  empleadoId: u.empleado?.idEmpleado || "",
  empleadoNombre: `${u.empleado?.nombre || ""} ${u.empleado?.apellidoP || ""}`.trim() || "—",
  usuario: u.nombreUsuario,
  activo: u.activo !== false,
  _raw: u,
});

const DEMO_U: any[] = [{ id: 1, empleadoId: 1, empleadoNombre: "Pedro Huamán", usuario: "pedro.huaman", _raw: {} }];
const DEMO_E: any[] = [{ id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", _raw: {} }];

export default function UsuariosPage() {
  const crud    = useCrud(usuariosService,  mapUsuario,  DEMO_U);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_E);
  const toast   = useToast();
  const m = useModalState();

  const [permisosModal, setPermisosModal] = useState<{ open: boolean; id: number; nombre: string }>({
    open: false, id: 0, nombre: "",
  });

  const fields: ModalField[] = [
    {
      key: "idEmpleado", label: "Empleado", required: true, type: "select",
      options: empCrud.data.map((e) => ({ value: e.id, label: `${e.nombre?.toUpperCase()} ${e.apellidoP?.toUpperCase()}` })),
      cols: 2,
    },
    { key: "nombreUsuario", label: "Nombre de usuario", required: true, placeholder: "pedro.huaman", hint: "4-50 caracteres" },
    { key: "contrasena",    label: "Contraseña",        required: !m.editing, type: "password", hint: "Mínimo 6 caracteres", minLength: 6, placeholder: m.editing ? "Dejar vacío para no cambiar" : undefined },
  ];

  const getFormData = (row: any) =>
    row ? { idEmpleado: row.empleadoId, nombreUsuario: row.usuario, contrasena: "" } : null;

  const handleSave = async (form: any) => {
    if (form.contrasena && form.contrasena.length < 6) {
      toast.showToast("fail", "Validación", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    const payload: any = { empleado: { idEmpleado: Number(form.idEmpleado) }, nombreUsuario: form.nombreUsuario };
    if (form.contrasena) payload.contrasena = form.contrasena;
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) {
      toast.showToast("success", m.editing ? "Usuario actualizado" : "Usuario creado", form.nombreUsuario);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  return (
    <>
      <DataTable
        title="Usuarios" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          {
            key: "empleadoNombre", label: "Empleado",
            render: (_, row: any) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-800">{row.empleadoNombre?.toUpperCase()}</div>
                  <div className="text-[11px] text-gray-400 font-mono">@{row.usuario}</div>
                </div>
              </div>
            ),
          },
          {
            key: "_estado", label: "Estado", sortable: false,
            render: (_, row: any) => row.activo
              ? <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-green-700 bg-green-100 rounded-full"><Unlock className="w-3 h-3" /> Activo</span>
              : <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-100 rounded-full"><Lock className="w-3 h-3" /> Inactivo</span>,
          },
          {
            key: "_acciones", label: "ACCIONES", sortable: false,
            render: (_, row: any) => (
              <div className="flex items-center gap-1.5">
                <button onClick={() => m.openEdit(row)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> EDITAR
                </button>
                <button onClick={() => setPermisosModal({ open: true, id: row.id, nombre: row.usuario })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Permisos
                </button>
              </div>
            ),
          },
        ]}
        onNew={m.openNew}
      />
      <EntityModal
        open={m.modalOpen} title="Usuario" icon={<User className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <PermisosModal
        open={permisosModal.open}
        usuarioId={permisosModal.id}
        usuarioNombre={permisosModal.nombre}
        readOnly={permisosModal.id >= 1 && permisosModal.id <= 4}
        onClose={() => setPermisosModal({ open: false, id: 0, nombre: "" })}
      />
    </>
  );
}
