import { CalendarCheck } from "lucide-react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import {
  reservasService, clientesService, habitacionesService, empleadosService,
} from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

const mapCliente    = (c: any) => ({ id: c.idCliente,    nombre: c.nombre,    apellidoP: c.apellidoPaterno, dni: c.dni,       _raw: c });
const mapEmpleado   = (e: any) => ({ id: e.idEmpleado,   nombre: e.nombre,    apellidoP: e.apellidoP,       _raw: e });
const mapHabitacion = (h: any) => ({
  id: h.idHabitacion, numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || "—", estado: h.estado,
  precio: Number(h.precio), _raw: h,
});
const mapReserva = (r: any) => ({
  id: r.idReserva,
  clienteId:    r.cliente?.idCliente    || "",
  habitacionId: r.habitacion?.idHabitacion || "",
  empleadoId:   r.empleado?.idEmpleado  || "",
  cliente:    `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
  habitacion: String(r.habitacion?.numeroHabitacion || "—"),
  empleado:   `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  fechaReserva: r.fechaReserva,
  ingreso:  r.fechaIngreso,
  salida:   r.fechaSalida,
  estado:   r.estadoReserva,
  _raw: r,
});

const DEMO_R: any[] = [{ id: 1, clienteId: 1, habitacionId: 1, empleadoId: 1, cliente: "María López", habitacion: "101", empleado: "Pedro Huamán", fechaReserva: "2025-07-01", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA", _raw: {} }];
const DEMO_C: any[] = [{ id: 1, nombre: "María López", apellidoP: "López", dni: "12345678", _raw: {} }];
const DEMO_H: any[] = [{ id: 1, numero: "101", tipo: "Estándar", estado: "OCUPADA", precio: 60, _raw: {} }];
const DEMO_E: any[] = [{ id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", _raw: {} }];

export default function ReservasPage() {
  const crud       = useCrud(reservasService,   mapReserva,    DEMO_R);
  const clientesCrud  = useCrud(clientesService,   mapCliente,    DEMO_C);
  const habCrud    = useCrud(habitacionesService, mapHabitacion, DEMO_H);
  const empCrud    = useCrud(empleadosService,   mapEmpleado,   DEMO_E);
  const m = useModalState();

  const today = new Date().toISOString().split("T")[0];

  const fields: ModalField[] = [
    {
      key: "idCliente", label: "Cliente", required: true, type: "select",
      options: clientesCrud.data.map((c) => ({ value: c.id, label: `${c.nombre} ${c.apellidoP} — DNI: ${c.dni}` })),
      cols: 2,
    },
    {
      key: "idHabitacion", label: "Habitación", required: true, type: "select",
      options: habCrud.data
        .filter((h) => h.estado === "DISPONIBLE" || m.editing?.habitacionId === h.id)
        .map((h) => ({ value: h.id, label: `#${h.numero} — ${h.tipo} (S/.${h.precio}/noche)` })),
      cols: 2,
    },
    {
      key: "idEmpleado", label: "Empleado a cargo", required: true, type: "select",
      options: empCrud.data.map((e) => ({ value: e.id, label: `${e.nombre} ${e.apellidoP}` })),
      cols: 2,
    },
    { key: "fechaReserva", label: "Fecha de Reserva", required: true, type: "date", max: today },
    { key: "fechaIngreso", label: "Fecha de Ingreso", required: true, type: "date", min: today },
    { key: "fechaSalida",  label: "Fecha de Salida",  required: true, type: "date", min: today },
    {
      key: "estadoReserva", label: "Estado", required: true, type: "select",
      options: [
        { value: "PENDIENTE",  label: "Pendiente" },
        { value: "CONFIRMADA", label: "Confirmada" },
        { value: "CANCELADA",  label: "Cancelada" },
        { value: "COMPLETADA", label: "Completada" },
      ],
    },
  ];

  const getFormData = (row: any) =>
    row
      ? { idCliente: row.clienteId, idHabitacion: row.habitacionId, idEmpleado: row.empleadoId, fechaReserva: row.fechaReserva, fechaIngreso: row.ingreso, fechaSalida: row.salida, estadoReserva: row.estado }
      : { estadoReserva: "PENDIENTE", fechaReserva: today };

  const handleSave = async (form: any) => {
    const payload = {
      cliente:    { idCliente:    Number(form.idCliente) },
      habitacion: { idHabitacion: Number(form.idHabitacion) },
      empleado:   { idEmpleado:   Number(form.idEmpleado) },
      fechaReserva: form.fechaReserva,
      fechaIngreso: form.fechaIngreso,
      fechaSalida:  form.fechaSalida,
      estadoReserva: form.estadoReserva,
    };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) m.closeModal();
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) m.closeDelete();
  };

  const handleCheckIn = async (row: any) => {
    await reservasService.update(row.id, { ...row._raw, estadoReserva: "CONFIRMADA", cliente: { idCliente: row.clienteId }, habitacion: { idHabitacion: row.habitacionId }, empleado: { idEmpleado: row.empleadoId } });
    const hab = habCrud.data.find((h) => h.id === row.habitacionId);
    if (hab) await habitacionesService.update(hab.id, { ...hab._raw, estado: "OCUPADA" });
    crud.refetch(); habCrud.refetch();
  };

  const handleCheckOut = async (row: any) => {
    await reservasService.update(row.id, { ...row._raw, estadoReserva: "COMPLETADA", cliente: { idCliente: row.clienteId }, habitacion: { idHabitacion: row.habitacionId }, empleado: { idEmpleado: row.empleadoId } });
    const hab = habCrud.data.find((h) => h.id === row.habitacionId);
    if (hab) await habitacionesService.update(hab.id, { ...hab._raw, estado: "DISPONIBLE" });
    crud.refetch(); habCrud.refetch();
  };

  return (
    <>
      <DataTable
        title="Reservas" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",         label: "ID" },
          { key: "cliente",    label: "Cliente" },
          { key: "habitacion", label: "Hab." },
          { key: "empleado",   label: "Empleado" },
          { key: "ingreso",    label: "Ingreso" },
          { key: "salida",     label: "Salida" },
          { key: "estado",     label: "Estado",  render: (v) => <StatusBadge status={v} /> },
          {
            key: "_actions", label: "Acciones rápidas",
            render: (_: any, row: any) => (
              <div className="flex items-center gap-1.5">
                {row.estado === "PENDIENTE" && (
                  <button onClick={() => handleCheckIn(row)} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors">
                    Check-in
                  </button>
                )}
                {row.estado === "CONFIRMADA" && (
                  <button onClick={() => handleCheckOut(row)} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors">
                    Check-out
                  </button>
                )}
              </div>
            ),
          },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Reserva" icon={<CalendarCheck className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="reserva"
        description={`¿Eliminar la reserva #${m.deleting?.id} de ${m.deleting?.cliente}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
