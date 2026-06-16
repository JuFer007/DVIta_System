import { Users, Pencil, Mail, Phone, FileText } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { clientesService, downloadPdf } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

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
  { key: "nombre",          label: "Nombre",          required: true, maxLength: 50, placeholder: "Ej: María" },
  { key: "apellidoPaterno", label: "Apellido Paterno", required: true, maxLength: 50, placeholder: "Ej: López" },
  { key: "apellidoMaterno", label: "Apellido Materno", required: true, maxLength: 50, placeholder: "Ej: Ríos" },
  { key: "dni",             label: "DNI",              required: true, pattern: "\\d{8}", placeholder: "12345678", hint: "8 dígitos exactos", maxLength: 8 },
  { key: "telefono",        label: "Teléfono",         required: true, pattern: "\\d{9}", placeholder: "987654321", hint: "9 dígitos exactos", maxLength: 9 },
  { key: "email",           label: "Email",            type: "email",  placeholder: "correo@email.com", hint: "ej: usuario@dominio.com", cols: 2 },
];

export default function ClientesPage() {
  const crud = useCrud(clientesService, mapCliente, DEMO);
  const m = useModalState();
  const toast = useToast();

  const getFormData = (row: any) =>
    row
      ? { nombre: row.nombre, apellidoPaterno: row.apellidoP, apellidoMaterno: row.apellidoM, dni: row.dni, telefono: row.telefono, email: row.email || "" }
      : null;

  const handleSave = async (form: any) => {
    if (!form.dni?.trim() || !/^\d{8}$/.test(form.dni)) {
      toast.showToast("fail", "Validación", "El DNI debe tener exactamente 8 dígitos numéricos");
      return;
    }
    if (!form.nombre?.trim() || !form.apellidoPaterno?.trim()) {
      toast.showToast("fail", "Validación", "Nombre y Apellido Paterno son obligatorios");
      return;
    }
    if (!form.telefono?.trim() || !/^\d{9}$/.test(form.telefono)) {
      toast.showToast("fail", "Validación", "El teléfono debe tener exactamente 9 dígitos numéricos");
      return;
    }
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.showToast("fail", "Validación", "El email no tiene un formato válido");
      return;
    }
    const payload = {
      nombre: form.nombre, apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno, dni: form.dni,
      telefono: form.telefono, email: form.email?.trim() || null,
    };
    const esNuevo = !m.editing;
    const ok = esNuevo ? await crud.create(payload) : await crud.update(m.editing.id, payload);
    if (ok) {
      toast.showToast("success",
        esNuevo ? "Cliente creado" : "Cliente actualizado",
        `${form.nombre} ${form.apellidoPaterno}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  return (
    <>
        <DataTable
        title="Clientes" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          {
            key: "nombre", label: "Nombre",
            render: (v: string, row: any) => (
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">
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
            key: "email", label: "Email",
            render: (v: string) => v ? (
              <a href={`mailto:${v}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 hover:underline">
                <Mail className="w-3 h-3" />{v}
              </a>
            ) : "—",
          },
        ]}
        onNew={m.openNew} onEdit={m.openEdit}
        headerExtra={
          <button onClick={() => downloadPdf("/api/clientes/pdf/reporte", "clientes.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF General
          </button>
        }
      />
      <EntityModal
        open={m.modalOpen} title="Cliente" icon={<Users className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
    </>
  );
}
