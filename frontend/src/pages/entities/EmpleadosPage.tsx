import { BriefcaseBusiness, Pencil, Trash2 } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

const CHATBOT_DNI = "00000000";

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
  const toast = useToast();

  const getFormData = (row: any) =>
    row
      ? { nombre: row.nombre, apellidoP: row.apellidoP, apellidoM: row.apellidoM, dni: row.dni, telefono: row.telefono }
      : null;

  const handleSave = async (form: any) => {
    if (!form.dni?.trim() || !/^\d{8}$/.test(form.dni)) {
      toast.showToast("fail", "Validación", "El DNI debe tener exactamente 8 dígitos numéricos");
      return;
    }
    if (!form.nombre?.trim() || !form.apellidoP?.trim()) {
      toast.showToast("fail", "Validación", "Nombre y Apellido Paterno son obligatorios");
      return;
    }
    if (!form.telefono?.trim() || !/^\d{9}$/.test(form.telefono)) {
      toast.showToast("fail", "Validación", "El teléfono debe tener exactamente 9 dígitos numéricos");
      return;
    }
    const payload = {
      nombre: form.nombre, apellidoP: form.apellidoP, apellidoM: form.apellidoM,
      dni: form.dni, telefono: form.telefono,
    };
    const esNuevo = !m.editing;
    const ok = esNuevo ? await crud.create(payload) : await crud.update(m.editing.id, payload);
    if (ok) {
      toast.showToast("success",
        esNuevo ? "Empleado creado" : "Empleado actualizado",
        `${form.nombre} ${form.apellidoP}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) {
      toast.showToast("success", "Empleado eliminado",
        `${m.deleting.nombre} ${m.deleting.apellidoP} eliminado correctamente`);
      m.closeDelete();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al eliminar", crud.saveError);
    }
  };

  const esChatbot = (row: any) => row.dni === CHATBOT_DNI;

  return (
    <>
      <DataTable
        title="Empleados" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "nombre",    label: "Nombre" },
          { key: "apellidoP", label: "Ap. Paterno" },
          { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni",       label: "DNI" },
          { key: "telefono",  label: "Teléfono" },
          {
            key: "_acciones", label: "",
            render: (_, row: any) => {
              if (esChatbot(row)) return null;
              return (
                <div className="flex items-center gap-1">
                  <button onClick={() => m.openEdit(row)}
                    className="p-1.5 text-brand-600 hover:bg-brand-100 rounded transition-colors"
                    title="Editar">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => m.openDelete(row)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            },
          },
        ]}
        onNew={m.openNew}
      />
      <EntityModal
        open={m.modalOpen} title="Empleado" icon={<BriefcaseBusiness className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="empleado"
        description={`¿Eliminar a ${m.deleting?.nombre} ${m.deleting?.apellidoP}? Esta acción no se puede deshacer.`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
