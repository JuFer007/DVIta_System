import { useState } from "react";
import { Users, BriefcaseBusiness, BedDouble, Bed, CalendarCheck, CreditCard, User, ConciergeBell, Crown } from "lucide-react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import EntityModal, { type ModalField } from "../components/EntityModal";
import ConfirmModal from "../components/ConfirmModal";
import { useCrud } from "../hooks/useCrud";
import {
  clientesService, empleadosService, habitacionesService,
  tiposService, reservasService, pagosService,
  usuariosService, recepcionistasService, administradoresService,
} from "../services/api";

const mapCliente = (c: any) => ({
  id: c.idCliente, nombre: c.nombre, apellidoP: c.apellidoPaterno,
  apellidoM: c.apellidoMaterno, dni: c.dni, telefono: c.telefono,
  email: c.email || "",
  // Guardar raw para edición
  _raw: c,
});

const mapEmpleado = (e: any) => ({
  id: e.idEmpleado, nombre: e.nombre, apellidoP: e.apellidoP,
  apellidoM: e.apellidoM, dni: e.dni, telefono: e.telefono,
  _raw: e,
});

const mapHabitacion = (h: any) => ({
  id: h.idHabitacion, numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || "—",
  tipoId: h.tipoHabitacion?.idTipoHabitacion || "",
  estado: h.estado,
  precio: Number(h.precio),
  precioFmt: `S/.${Number(h.precio).toFixed(2)}`,
  _raw: h,
});

const mapTipo = (t: any) => ({
  id: t.idTipoHabitacion, descripcion: t.descripcion,
  precio: Number(t.precio),
  precioFmt: `S/.${Number(t.precio).toFixed(2)}`,
  _raw: t,
});

const mapReserva = (r: any) => ({
  id: r.idReserva,
  clienteId: r.cliente?.idCliente || "",
  habitacionId: r.habitacion?.idHabitacion || "",
  empleadoId: r.empleado?.idEmpleado || "",
  cliente: `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
  habitacion: String(r.habitacion?.numeroHabitacion || "—"),
  empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  fechaReserva: r.fechaReserva,
  ingreso: r.fechaIngreso,
  salida: r.fechaSalida,
  estado: r.estadoReserva,
  _raw: r,
});

const mapPago = (p: any) => ({
  id: p.idPago,
  reservaId: p.reserva?.idReserva || "",
  reserva: `#${p.reserva?.idReserva || "?"} – ${p.reserva?.cliente?.nombre || "—"}`,
  monto: Number(p.monto),
  montoFmt: `S/.${Number(p.monto).toFixed(2)}`,
  fecha: p.fechaPago,
  metodo: p.metodoPago,
  _raw: p,
});

const mapUsuario = (u: any) => ({
  id: u.idUsuario,
  empleadoId: u.empleado?.idEmpleado || "",
  empleado: `${u.empleado?.nombre || ""} ${u.empleado?.apellidoP || ""}`.trim() || "—",
  usuario: u.nombreUsuario, contrasena: "••••••••",
  _raw: u,
});

const mapRecepcionista = (r: any) => ({
  id: r.idRecepcionista,
  empleadoId: r.empleado?.idEmpleado || "",
  empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  turno: r.turnoTrabajo,
  _raw: r,
});

const mapAdministrador = (a: any) => ({
  id: a.idAdministrador,
  empleadoId: a.empleado?.idEmpleado || "",
  empleado: `${a.empleado?.nombre || ""} ${a.empleado?.apellidoP || ""}`.trim() || "—",
  correo: a.correoElectronico,
  _raw: a,
});

// ── Fallback demo data ─────────────────────────────────────────────────────────

const DEMO_CLIENTES: any[] = [
  { id: 1, nombre: "María López", apellidoP: "López", apellidoM: "Ríos", dni: "12345678", telefono: "987654321", email: "maria@gmail.com", _raw: {} },
  { id: 2, nombre: "Carlos Ruiz", apellidoP: "Ruiz", apellidoM: "Torres", dni: "23456789", telefono: "976543210", email: "carlos@gmail.com", _raw: {} },
];
const DEMO_EMPLEADOS: any[] = [
  { id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán", apellidoM: "García", dni: "11223344", telefono: "912345678", _raw: {} },
  { id: 2, nombre: "Rosa Condori", apellidoP: "Condori", apellidoM: "Lima", dni: "22334455", telefono: "923456789", _raw: {} },
];
const DEMO_HABITACIONES: any[] = [
  { id: 1, numero: "101", tipo: "Estándar", tipoId: 1, estado: "OCUPADA", precio: 60, precioFmt: "S/.60.00", _raw: {} },
  { id: 2, numero: "201", tipo: "Suite", tipoId: 2, estado: "DISPONIBLE", precio: 120, precioFmt: "S/.120.00", _raw: {} },
];
const DEMO_TIPOS: any[] = [
  { id: 1, descripcion: "Habitación Estándar", precio: 60, precioFmt: "S/.60.00", _raw: {} },
  { id: 2, descripcion: "Suite Deluxe", precio: 120, precioFmt: "S/.120.00", _raw: {} },
];
const DEMO_RESERVAS: any[] = [
  { id: 1, clienteId: 1, habitacionId: 1, empleadoId: 1, cliente: "María López", habitacion: "101", empleado: "Pedro Huamán", fechaReserva: "2025-07-01", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA", _raw: {} },
];
const DEMO_PAGOS: any[] = [
  { id: 1, reservaId: 1, reserva: "#1 – María López", monto: 240, montoFmt: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE", _raw: {} },
];
const DEMO_USUARIOS: any[] = [
  { id: 1, empleadoId: 1, empleado: "Pedro Huamán", usuario: "pedro.huaman", contrasena: "••••••••", _raw: {} },
];
const DEMO_RECEPCIONISTAS: any[] = [
  { id: 1, empleadoId: 2, empleado: "Rosa Condori", turno: "MAÑANA", _raw: {} },
];
const DEMO_ADMINISTRADORES: any[] = [
  { id: 1, empleadoId: 1, empleado: "Pedro Huamán", correo: "pedro.admin@dvita.pe", _raw: {} },
];

// ── Hook de estado del modal ───────────────────────────────────────────────────

function useModalState() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<any | null>(null);

  return {
    modalOpen, editing, deleteOpen, deleting,
    openNew: () => { setEditing(null); setModalOpen(true); },
    openEdit: (row: any) => { setEditing(row); setModalOpen(true); },
    closeModal: () => { setModalOpen(false); setEditing(null); },
    openDelete: (row: any) => { setDeleting(row); setDeleteOpen(true); },
    closeDelete: () => { setDeleteOpen(false); setDeleting(null); },
  };
}

export function ClientesPage() {
  const crud = useCrud(clientesService, mapCliente, DEMO_CLIENTES);
  const m = useModalState();

  const fields: ModalField[] = [
    { key: "nombre",           label: "Nombre",           required: true,  placeholder: "Ej: María", cols: 1 },
    { key: "apellidoPaterno",  label: "Apellido Paterno",  required: true,  placeholder: "Ej: López", cols: 1 },
    { key: "apellidoMaterno",  label: "Apellido Materno",  required: true,  placeholder: "Ej: Ríos",  cols: 1 },
    { key: "dni",              label: "DNI",               required: true,  placeholder: "12345678",   hint: "8 dígitos" },
    { key: "telefono",         label: "Teléfono",          required: true,  placeholder: "987654321",  hint: "9-15 dígitos" },
    { key: "email",            label: "Email",             type: "email",   placeholder: "correo@email.com", cols: 2 },
  ];

  const getFormData = (row: any) => row ? {
    nombre: row.nombre, apellidoPaterno: row.apellidoP, apellidoMaterno: row.apellidoM,
    dni: row.dni, telefono: row.telefono, email: row.email || "",
  } : null;

  const handleSave = async (form: any) => {
    const payload = {
      nombre: form.nombre, apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno, dni: form.dni,
      telefono: form.telefono, email: form.email || null,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
          { key: "id", label: "ID" }, { key: "nombre", label: "Nombre" },
          { key: "apellidoP", label: "Ap. Paterno" }, { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni", label: "DNI" }, { key: "telefono", label: "Teléfono" }, { key: "email", label: "Email" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Cliente" icon={<Users className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
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

export function EmpleadosPage() {
  const crud = useCrud(empleadosService, mapEmpleado, DEMO_EMPLEADOS);
  const m = useModalState();

  const fields: ModalField[] = [
    { key: "nombre",    label: "Nombre",           required: true, placeholder: "Ej: Pedro" },
    { key: "apellidoP", label: "Apellido Paterno",  required: true, placeholder: "Ej: Huamán" },
    { key: "apellidoM", label: "Apellido Materno",  required: true, placeholder: "Ej: García" },
    { key: "dni",       label: "DNI",               required: true, placeholder: "12345678", hint: "8 dígitos exactos" },
    { key: "telefono",  label: "Teléfono",          required: true, placeholder: "912345678" },
  ];

  const getFormData = (row: any) => row ? {
    nombre: row.nombre, apellidoP: row.apellidoP, apellidoM: row.apellidoM,
    dni: row.dni, telefono: row.telefono,
  } : null;

  const handleSave = async (form: any) => {
    const ok = m.editing
      ? await crud.update(m.editing.id, { nombre: form.nombre, apellidoP: form.apellidoP, apellidoM: form.apellidoM, dni: form.dni, telefono: form.telefono })
      : await crud.create({ nombre: form.nombre, apellidoP: form.apellidoP, apellidoM: form.apellidoM, dni: form.dni, telefono: form.telefono });
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
          { key: "id", label: "ID" }, { key: "nombre", label: "Nombre" },
          { key: "apellidoP", label: "Ap. Paterno" }, { key: "apellidoM", label: "Ap. Materno" },
          { key: "dni", label: "DNI" }, { key: "telefono", label: "Teléfono" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Empleado" icon={<BriefcaseBusiness className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
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

export function TiposPage() {
  const crud = useCrud(tiposService, mapTipo, DEMO_TIPOS);
  const m = useModalState();

  const fields: ModalField[] = [
    { key: "descripcion", label: "Descripción", required: true, placeholder: "Ej: Suite Deluxe", cols: 2 },
    { key: "precio",      label: "Precio (S/.)", required: true, type: "number", placeholder: "120.00", hint: "Precio base por noche" },
  ];

  const getFormData = (row: any) => row ? { descripcion: row.descripcion, precio: row.precio } : null;

  const handleSave = async (form: any) => {
    const ok = m.editing
      ? await crud.update(m.editing.id, { descripcion: form.descripcion, precio: parseFloat(form.precio) })
      : await crud.create({ descripcion: form.descripcion, precio: parseFloat(form.precio) });
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
        title="Tipos de Habitación" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id", label: "ID" },
          { key: "descripcion", label: "Descripción" },
          { key: "precioFmt", label: "Precio" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Tipo de Habitación" icon={<Bed className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="tipo de habitación"
        description={`¿Eliminar el tipo "${m.deleting?.descripcion}"?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}

export function HabitacionesPage() {
  const crud = useCrud(habitacionesService, mapHabitacion, DEMO_HABITACIONES);
  const tiposCrud = useCrud(tiposService, mapTipo, DEMO_TIPOS);
  const m = useModalState();

  const tipoOptions = tiposCrud.data.map((t) => ({
    value: t.id,
    label: `${t.descripcion} — S/.${t.precio}/noche`,
  }));

  const fields: ModalField[] = [
    {
      key: "idTipoHabitacion", label: "Tipo de Habitación", required: true,
      type: "select", options: tipoOptions,
    },
    { key: "numeroHabitacion", label: "Número de Habitación", required: true, type: "number", placeholder: "101" },
    {
      key: "estado", label: "Estado", required: true, type: "select",
      options: [
        { value: "DISPONIBLE",    label: "Disponible" },
        { value: "OCUPADA",       label: "Ocupada" },
        { value: "MANTENIMIENTO", label: "Mantenimiento" },
      ],
    },
    { key: "precio", label: "Precio (S/.)", required: true, type: "number", placeholder: "60.00", hint: "Puede diferir del tipo" },
  ];

  const getFormData = (row: any) => row ? {
    idTipoHabitacion: row.tipoId,
    numeroHabitacion: row.numero,
    estado: row.estado,
    precio: row.precio,
  } : null;

  const handleSave = async (form: any) => {
    const payload = {
      tipoHabitacion: { idTipoHabitacion: Number(form.idTipoHabitacion) },
      numeroHabitacion: Number(form.numeroHabitacion),
      estado: form.estado,
      precio: parseFloat(form.precio),
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
        title="Habitaciones" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id", label: "ID" }, { key: "numero", label: "Nº" },
          { key: "tipo", label: "Tipo" },
          { key: "estado", label: "Estado", render: (v) => <StatusBadge status={v} /> },
          { key: "precioFmt", label: "Precio" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Habitación" icon={<BedDouble className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="habitación"
        description={`¿Eliminar la habitación #${m.deleting?.numero}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}

export function ReservasPage() {
  const crud = useCrud(reservasService, mapReserva, DEMO_RESERVAS);
  const clientesCrud = useCrud(clientesService, mapCliente, DEMO_CLIENTES);
  const habCrud = useCrud(habitacionesService, mapHabitacion, DEMO_HABITACIONES);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_EMPLEADOS);
  const m = useModalState();

  const today = new Date().toISOString().split("T")[0];

  const clienteOptions = clientesCrud.data.map((c) => ({
    value: c.id,
    label: `${c.nombre} ${c.apellidoP} — DNI: ${c.dni}`,
  }));
  const habOptions = habCrud.data
    .filter((h) => h.estado === "DISPONIBLE" || m.editing?.habitacionId === h.id)
    .map((h) => ({ value: h.id, label: `#${h.numero} — ${h.tipo} (S/.${h.precio}/noche)` }));
  const empOptions = empCrud.data.map((e) => ({
    value: e.id,
    label: `${e.nombre} ${e.apellidoP}`,
  }));

  const fields: ModalField[] = [
    { key: "idCliente",     label: "Cliente",           required: true, type: "select", options: clienteOptions,  cols: 2 },
    { key: "idHabitacion",  label: "Habitación",        required: true, type: "select", options: habOptions,      cols: 2 },
    { key: "idEmpleado",    label: "Empleado a cargo",  required: true, type: "select", options: empOptions,      cols: 2 },
    { key: "fechaReserva",  label: "Fecha de Reserva",  required: true, type: "date",   max: today },
    { key: "fechaIngreso",  label: "Fecha de Ingreso",  required: true, type: "date",   min: today },
    { key: "fechaSalida",   label: "Fecha de Salida",   required: true, type: "date",   min: today },
    {
      key: "estadoReserva", label: "Estado", required: true, type: "select",
      options: [
        { value: "PENDIENTE",   label: "Pendiente" },
        { value: "CONFIRMADA",  label: "Confirmada" },
        { value: "CANCELADA",   label: "Cancelada" },
        { value: "COMPLETADA",  label: "Completada" },
      ],
    },
  ];

  const getFormData = (row: any) => row ? {
    idCliente: row.clienteId, idHabitacion: row.habitacionId,
    idEmpleado: row.empleadoId, fechaReserva: row.fechaReserva,
    fechaIngreso: row.ingreso, fechaSalida: row.salida, estadoReserva: row.estado,
  } : { estadoReserva: "PENDIENTE", fechaReserva: today };

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
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
    if (ok) m.closeModal();
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) m.closeDelete();
  };

  const handleCheckIn = async (row: any) => {
    await reservasService.update(row.id, {
      ...row._raw,
      estadoReserva: "CONFIRMADA",
      cliente:    { idCliente:    row.clienteId },
      habitacion: { idHabitacion: row.habitacionId },
      empleado:   { idEmpleado:   row.empleadoId },
    });
    await habitacionesService.update(row.habitacionId, {
      ...habCrud.data.find((h) => h.id === row.habitacionId)?._raw,
      estado: "OCUPADA",
    });
    crud.refetch();
    habCrud.refetch();
  };

  const handleCheckOut = async (row: any) => {
    await reservasService.update(row.id, {
      ...row._raw,
      estadoReserva: "COMPLETADA",
      cliente:    { idCliente:    row.clienteId },
      habitacion: { idHabitacion: row.habitacionId },
      empleado:   { idEmpleado:   row.empleadoId },
    });
    await habitacionesService.update(row.habitacionId, {
      ...habCrud.data.find((h) => h.id === row.habitacionId)?._raw,
      estado: "DISPONIBLE",
    });
    crud.refetch();
    habCrud.refetch();
  };

  return (
    <>
      <DataTable
        title="Reservas" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id", label: "ID" },
          { key: "cliente", label: "Cliente" },
          { key: "habitacion", label: "Hab." },
          { key: "empleado", label: "Empleado" },
          { key: "ingreso", label: "Ingreso" },
          { key: "salida", label: "Salida" },
          {
            key: "estado", label: "Estado",
            render: (v) => <StatusBadge status={v} />,
          },
          {
            key: "_actions",
            label: "Acciones rápidas",
            render: (_: any, row: any) => (
              <div className="flex items-center gap-1.5">
                {row.estado === "PENDIENTE" && (
                  <button
                    onClick={() => handleCheckIn(row)}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                  >
                    Check-in
                  </button>
                )}
                {row.estado === "CONFIRMADA" && (
                  <button
                    onClick={() => handleCheckOut(row)}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                  >
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

export function PagosPage() {
  const crud = useCrud(pagosService, mapPago, DEMO_PAGOS);
  const reservasCrud = useCrud(reservasService, mapReserva, DEMO_RESERVAS);
  const m = useModalState();

  const today = new Date().toISOString().split("T")[0];

  const reservaOptions = reservasCrud.data.map((r) => ({
    value: r.id,
    label: `#${r.id} — ${r.cliente} (Hab. ${r.habitacion})`,
  }));

  const fields: ModalField[] = [
    { key: "idReserva", label: "Reserva", required: true, type: "select", options: reservaOptions, cols: 2 },
    { key: "monto",     label: "Monto (S/.)", required: true, type: "number", placeholder: "240.00" },
    { key: "fechaPago", label: "Fecha de Pago", required: true, type: "date", max: today },
    {
      key: "metodoPago", label: "Método de Pago", required: true, type: "select",
      options: [
        { value: "EFECTIVO",         label: "Efectivo" },
        { value: "TARJETA_CREDITO",  label: "Tarjeta de Crédito" },
        { value: "TARJETA_DEBITO",   label: "Tarjeta de Débito" },
        { value: "TRANSFERENCIA",    label: "Transferencia" },
        { value: "YAPE",             label: "Yape" },
        { value: "PLIN",             label: "Plin" },
      ],
      cols: 2,
    },
  ];

  const getFormData = (row: any) => row ? {
    idReserva: row.reservaId, monto: row.monto,
    fechaPago: row.fecha, metodoPago: row.metodo,
  } : { fechaPago: today };

  const handleSave = async (form: any) => {
    const payload = {
      reserva: { idReserva: Number(form.idReserva) },
      monto: parseFloat(form.monto),
      fechaPago: form.fechaPago,
      metodoPago: form.metodoPago,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
        title="Pagos" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id", label: "ID" }, { key: "reserva", label: "Reserva" },
          { key: "montoFmt", label: "Monto" }, { key: "fecha", label: "Fecha" },
          { key: "metodo", label: "Método" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Pago" icon={<CreditCard className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="pago"
        description={`¿Eliminar el pago #${m.deleting?.id} de ${m.deleting?.montoFmt}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}

export function UsuariosPage() {
  const crud = useCrud(usuariosService, mapUsuario, DEMO_USUARIOS);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_EMPLEADOS);
  const m = useModalState();

  const empOptions = empCrud.data.map((e) => ({
    value: e.id,
    label: `${e.nombre} ${e.apellidoP}`,
  }));

  const fields: ModalField[] = [
    { key: "idEmpleado",    label: "Empleado",       required: true, type: "select", options: empOptions, cols: 2 },
    { key: "nombreUsuario", label: "Nombre de usuario", required: true, placeholder: "pedro.huaman", hint: "4-50 caracteres" },
    { key: "contrasena",    label: "Contraseña",     required: !m.editing, type: "password", hint: "Mínimo 8 caracteres", placeholder: m.editing ? "Dejar vacío para no cambiar" : undefined },
  ];

  const getFormData = (row: any) => row ? {
    idEmpleado: row.empleadoId, nombreUsuario: row.usuario, contrasena: "",
  } : null;

  const handleSave = async (form: any) => {
    const payload: any = {
      empleado: { idEmpleado: Number(form.idEmpleado) },
      nombreUsuario: form.nombreUsuario,
    };
    if (form.contrasena) payload.contrasena = form.contrasena;
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
          { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" },
          { key: "usuario", label: "Usuario" }, { key: "contrasena", label: "Contraseña" },
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

export function RecepcionistasPage() {
  const crud = useCrud(recepcionistasService, mapRecepcionista, DEMO_RECEPCIONISTAS);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_EMPLEADOS);
  const m = useModalState();

  const empOptions = empCrud.data.map((e) => ({
    value: e.id,
    label: `${e.nombre} ${e.apellidoP}`,
  }));

  const fields: ModalField[] = [
    { key: "idEmpleado",  label: "Empleado", required: true, type: "select", options: empOptions, cols: 2 },
    {
      key: "turnoTrabajo", label: "Turno de Trabajo", required: true, type: "select",
      options: [
        { value: "MAÑANA",  label: "Mañana (6:00 – 14:00)" },
        { value: "TARDE",   label: "Tarde (14:00 – 22:00)" },
        { value: "NOCHE",   label: "Noche (22:00 – 6:00)" },
      ],
    },
  ];

  const getFormData = (row: any) => row ? {
    idEmpleado: row.empleadoId, turnoTrabajo: row.turno,
  } : null;

  const handleSave = async (form: any) => {
    const payload = {
      empleado: { idEmpleado: Number(form.idEmpleado) },
      turnoTrabajo: form.turnoTrabajo,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
        title="Recepcionistas" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" },
          { key: "turno", label: "Turno" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Recepcionista" icon={<ConciergeBell className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="recepcionista"
        description={`¿Eliminar al recepcionista ${m.deleting?.empleado}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}

export function AdministradoresPage() {
  const crud = useCrud(administradoresService, mapAdministrador, DEMO_ADMINISTRADORES);
  const empCrud = useCrud(empleadosService, mapEmpleado, DEMO_EMPLEADOS);
  const m = useModalState();

  const empOptions = empCrud.data.map((e) => ({
    value: e.id,
    label: `${e.nombre} ${e.apellidoP}`,
  }));

  const fields: ModalField[] = [
    { key: "idEmpleado",       label: "Empleado",           required: true, type: "select", options: empOptions, cols: 2 },
    { key: "correoElectronico", label: "Correo Electrónico", required: true, type: "email",  placeholder: "admin@dvita.pe", cols: 2 },
  ];

  const getFormData = (row: any) => row ? {
    idEmpleado: row.empleadoId, correoElectronico: row.correo,
  } : null;

  const handleSave = async (form: any) => {
    const payload = {
      empleado: { idEmpleado: Number(form.idEmpleado) },
      correoElectronico: form.correoElectronico,
    };
    const ok = m.editing
      ? await crud.update(m.editing.id, payload)
      : await crud.create(payload);
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
          { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" },
          { key: "correo", label: "Correo" },
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
