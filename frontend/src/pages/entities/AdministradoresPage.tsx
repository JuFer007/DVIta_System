import { Crown, Pencil, Mail } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { administradoresService, empleadosService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

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
  const toast   = useToast();
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
    if (form.correoElectronico && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correoElectronico)) {
      toast.showToast("fail", "Validación", "Correo electrónico no válido");
      return;
    }
    const payload = { empleado: { idEmpleado: Number(form.idEmpleado) }, correoElectronico: form.correoElectronico };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) {
      toast.showToast("success", m.editing ? "Administrador actualizado" : "Administrador creado", form.correoElectronico);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  return (
    <>
      <DataTable
        title="Administradores" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          {
            key: "empleado", label: "Empleado",
            render: (v: string, row: any) => (
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                  <Crown className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-gray-800">{v}</span>
              </div>
            ),
          },
          {
            key: "correo", label: "Correo",
            render: (v: string) => v ? (
              <a href={`mailto:${v}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 hover:underline">
                <Mail className="w-3 h-3" />{v}
              </a>
            ) : "—",
          },
        ]}
        onNew={m.openNew} onEdit={m.openEdit}
      />
      <EntityModal
        open={m.modalOpen} title="Administrador" icon={<Crown className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
    </>
  );
}
