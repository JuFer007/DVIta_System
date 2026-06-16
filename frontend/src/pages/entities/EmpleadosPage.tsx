import { useState } from "react";
import { BriefcaseBusiness, Pencil, Power, Phone, FileText } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { empleadosService, downloadPdf } from "../../services/api";
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
  activo: e.activo !== false,
  _raw: e,
});

const DEMO: any[] = [
  { id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", apellidoM: "García", dni: "11223344", telefono: "912345678", _raw: {} },
  { id: 2, nombre: "Rosa Condori", apellidoP: "Condori", apellidoM: "Lima",   dni: "22334455", telefono: "923456789", _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "nombre",    label: "Nombre",          required: true, maxLength: 50, placeholder: "Ej: Pedro" },
  { key: "apellidoP", label: "Apellido Paterno", required: true, maxLength: 50, placeholder: "Ej: Huamán" },
  { key: "apellidoM", label: "Apellido Materno", required: true, maxLength: 50, placeholder: "Ej: García" },
  { key: "dni",       label: "DNI",              required: true, pattern: "\\d{8}", placeholder: "12345678", hint: "8 dígitos exactos", maxLength: 8 },
  { key: "telefono",  label: "Teléfono",         required: true, pattern: "\\d{9}", placeholder: "912345678", hint: "9 dígitos exactos", maxLength: 9 },
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

  const esChatbot = (row: any) => row.dni === CHATBOT_DNI;

  const [togglingEmpleado, setTogglingEmpleado] = useState<any>(null);

  const handleToggleActivo = async () => {
    if (!togglingEmpleado) return;
    try {
      const res = await fetch(`/api/empleados/${togglingEmpleado.id}/toggle-activo`, { method: "PATCH" });
      if (res.ok) {
        toast.showToast("success", "Estado actualizado", `${togglingEmpleado.nombre} ${togglingEmpleado.apellidoP}`);
        crud.refetch();
      } else {
        toast.showToast("fail", "Error", "No se pudo cambiar el estado");
      }
    } catch {
      toast.showToast("fail", "Error", "No se pudo cambiar el estado");
    }
    setTogglingEmpleado(null);
  };

  return (
    <>
      <DataTable
        title="Empleados" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          {
            key: "nombre", label: "Nombre",
            render: (v: string, row: any) => (
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {(row.nombre || "?").charAt(0)}
                </span>
                <span className="font-medium text-gray-800">{row.nombre}</span>
              </div>
            ),
          },
          { key: "apellidoP", label: "Ap. Paterno" },
          { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni",       label: "DNI" },
          {
            key: "telefono", label: "Teléfono",
            render: (v: string) => v ? <span className="inline-flex items-center gap-1.5 text-gray-600"><Phone className="w-3 h-3 text-gray-400" />{v}</span> : "—",
          },
          {
            key: "activo", label: "Estado",
            render: (v: boolean) => (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${v ? "bg-green-600" : "bg-red-600"}`} />
                {v ? "Activo" : "Inactivo"}
              </span>
            ),
          },
          {
            key: "_acciones", label: "ACCIONES",
            render: (_, row: any) => {
              if (esChatbot(row)) return null;
              return (
                <div className="flex items-center gap-1">
                  <button onClick={() => m.openEdit(row)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> EDITAR
                  </button>
                  <button onClick={() => setTogglingEmpleado(row)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${row.activo ? "text-red-700 bg-red-100 hover:bg-red-200" : "text-green-700 bg-green-100 hover:bg-green-200"}`}>
                    <Power className="w-3.5 h-3.5" /> {row.activo ? "DESACTIVAR" : "ACTIVAR"}
                  </button>
                </div>
              );
            },
          },
        ]}
        onNew={m.openNew}
        headerExtra={
          <button onClick={() => downloadPdf("/api/empleados/pdf/reporte", "empleados.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF General
          </button>
        }
      />
      <EntityModal
        open={m.modalOpen} title="Empleado" icon={<BriefcaseBusiness className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={!!togglingEmpleado}
        title={`${togglingEmpleado?.activo ? "desactivar" : "activar"} empleado`}
        description={`¿${togglingEmpleado?.activo ? "Desactivar" : "Activar"} a ${togglingEmpleado?.nombre} ${togglingEmpleado?.apellidoP}?`}
        loading={crud.saving}
        onClose={() => setTogglingEmpleado(null)}
        onConfirm={handleToggleActivo}
      />
    </>
  );
}
