import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { useApiData } from "../hooks/useApiData";
import {
  clientesService, empleadosService, habitacionesService,
  tiposService, reservasService, pagosService,
  usuariosService, recepcionistasService, administradoresService,
} from "../services/api";

// ── Demo data (fallback si backend no responde) ───────────────────────────────
const DEMO_CLIENTES = [
  { id: 1, nombre: "María López",  apellidoP: "López",  apellidoM: "Ríos",   dni: "12345678", telefono: "987654321", email: "maria@gmail.com" },
  { id: 2, nombre: "Carlos Ruiz",  apellidoP: "Ruiz",   apellidoM: "Torres", dni: "23456789", telefono: "976543210", email: "carlos@gmail.com" },
  { id: 3, nombre: "Ana Torres",   apellidoP: "Torres", apellidoM: "Vega",   dni: "34567890", telefono: "965432109", email: "ana@gmail.com" },
];
const DEMO_EMPLEADOS = [
  { id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán",  apellidoM: "García", dni: "11223344", telefono: "912345678" },
  { id: 2, nombre: "Rosa Condori", apellidoP: "Condori", apellidoM: "Lima",   dni: "22334455", telefono: "923456789" },
];
const DEMO_HABITACIONES = [
  { id: 1, numero: "101", tipo: "Estándar",  estado: "OCUPADA",       precio: "S/.60.00" },
  { id: 2, numero: "201", tipo: "Suite",     estado: "DISPONIBLE",    precio: "S/.120.00" },
  { id: 3, numero: "301", tipo: "Familiar",  estado: "MANTENIMIENTO", precio: "S/.180.00" },
];
const DEMO_TIPOS = [
  { id: 1, descripcion: "Habitación Estándar",   precio: "S/.60.00" },
  { id: 2, descripcion: "Suite Deluxe",           precio: "S/.120.00" },
  { id: 3, descripcion: "Habitación Familiar",    precio: "S/.180.00" },
];
const DEMO_RESERVAS = [
  { id: 1, cliente: "María López", habitacion: "101", empleado: "Pedro Huamán", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz", habitacion: "201", empleado: "Rosa Condori", ingreso: "2025-07-09", salida: "2025-07-11", estado: "PENDIENTE" },
];
const DEMO_PAGOS = [
  { id: 1, reserva: "#1 – María López", monto: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE" },
];
const DEMO_USUARIOS = [
  { id: 1, empleado: "Pedro Huamán", usuario: "pedro.huaman", contrasena: "••••••••" },
  { id: 2, empleado: "Rosa Condori", usuario: "rosa.condori", contrasena: "••••••••" },
];
const DEMO_RECEPCIONISTAS = [
  { id: 1, empleado: "Rosa Condori", turno: "MAÑANA" },
];
const DEMO_ADMINISTRADORES = [
  { id: 1, empleado: "Pedro Huamán", correo: "pedro.admin@dvita.pe" },
];

// ── Mappers: transforma respuesta del backend al formato de la tabla ──────────
const mapCliente = (c: any) => ({
  id: c.idCliente, nombre: c.nombre, apellidoP: c.apellidoPaterno,
  apellidoM: c.apellidoMaterno, dni: c.dni, telefono: c.telefono, email: c.email || "—",
});
const mapEmpleado = (e: any) => ({
  id: e.idEmpleado, nombre: e.nombre, apellidoP: e.apellidoP,
  apellidoM: e.apellidoM, dni: e.dni, telefono: e.telefono,
});
const mapHabitacion = (h: any) => ({
  id: h.idHabitacion, numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || "—", estado: h.estado,
  precio: `S/.${Number(h.precio).toFixed(2)}`,
});
const mapTipo = (t: any) => ({
  id: t.idTipoHabitacion, descripcion: t.descripcion,
  precio: `S/.${Number(t.precio).toFixed(2)}`,
});
const mapReserva = (r: any) => ({
  id: r.idReserva,
  cliente: `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
  habitacion: String(r.habitacion?.numeroHabitacion || "—"),
  empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  ingreso: r.fechaIngreso, salida: r.fechaSalida, estado: r.estadoReserva,
});
const mapPago = (p: any) => ({
  id: p.idPago,
  reserva: `#${p.reserva?.idReserva || "?"} – ${p.reserva?.cliente?.nombre || "—"}`,
  monto: `S/.${Number(p.monto).toFixed(2)}`,
  fecha: p.fechaPago, metodo: p.metodoPago,
});
const mapUsuario = (u: any) => ({
  id: u.idUsuario,
  empleado: `${u.empleado?.nombre || ""} ${u.empleado?.apellidoP || ""}`.trim() || "—",
  usuario: u.nombreUsuario, contrasena: "••••••••",
});
const mapRecepcionista = (r: any) => ({
  id: r.idRecepcionista,
  empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  turno: r.turnoTrabajo,
});
const mapAdministrador = (a: any) => ({
  id: a.idAdministrador,
  empleado: `${a.empleado?.nombre || ""} ${a.empleado?.apellidoP || ""}`.trim() || "—",
  correo: a.correoElectronico,
});

// ── Páginas ───────────────────────────────────────────────────────────────────

export function ClientesPage() {
  const { data, loading, error } = useApiData(
    async () => (await clientesService.getAll()).map(mapCliente),
    DEMO_CLIENTES
  );
  return (
    <DataTable
      title="Clientes" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "nombre", label: "Nombre" },
        { key: "apellidoP", label: "Ap. Paterno" }, { key: "apellidoM", label: "Ap. Materno" },
        { key: "dni", label: "DNI" }, { key: "telefono", label: "Teléfono" }, { key: "email", label: "Email" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function EmpleadosPage() {
  const { data, loading, error } = useApiData(
    async () => (await empleadosService.getAll()).map(mapEmpleado),
    DEMO_EMPLEADOS
  );
  return (
    <DataTable
      title="Empleados" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "nombre", label: "Nombre" },
        { key: "apellidoP", label: "Ap. Paterno" }, { key: "apellidoM", label: "Ap. Materno" },
        { key: "dni", label: "DNI" }, { key: "telefono", label: "Teléfono" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function HabitacionesPage() {
  const { data, loading, error } = useApiData(
    async () => (await habitacionesService.getAll()).map(mapHabitacion),
    DEMO_HABITACIONES
  );
  return (
    <DataTable
      title="Habitaciones" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "numero", label: "Nº" },
        { key: "tipo", label: "Tipo" },
        { key: "estado", label: "Estado", render: (v) => <StatusBadge status={v} /> },
        { key: "precio", label: "Precio" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function TiposPage() {
  const { data, loading, error } = useApiData(
    async () => (await tiposService.getAll()).map(mapTipo),
    DEMO_TIPOS
  );
  return (
    <DataTable
      title="Tipos de Habitación" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "descripcion", label: "Descripción" }, { key: "precio", label: "Precio" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function ReservasPage() {
  const { data, loading, error } = useApiData(
    async () => (await reservasService.getAll()).map(mapReserva),
    DEMO_RESERVAS
  );
  return (
    <DataTable
      title="Reservas" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "cliente", label: "Cliente" },
        { key: "habitacion", label: "Habitación" }, { key: "empleado", label: "Empleado" },
        { key: "ingreso", label: "Ingreso" }, { key: "salida", label: "Salida" },
        { key: "estado", label: "Estado", render: (v) => <StatusBadge status={v} /> },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function PagosPage() {
  const { data, loading, error } = useApiData(
    async () => (await pagosService.getAll()).map(mapPago),
    DEMO_PAGOS
  );
  return (
    <DataTable
      title="Pagos" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "reserva", label: "Reserva" },
        { key: "monto", label: "Monto" }, { key: "fecha", label: "Fecha" }, { key: "metodo", label: "Método" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function UsuariosPage() {
  const { data, loading, error } = useApiData(
    async () => (await usuariosService.getAll()).map(mapUsuario),
    DEMO_USUARIOS
  );
  return (
    <DataTable
      title="Usuarios" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" },
        { key: "usuario", label: "Usuario" }, { key: "contrasena", label: "Contraseña" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function RecepcionistasPage() {
  const { data, loading, error } = useApiData(
    async () => (await recepcionistasService.getAll()).map(mapRecepcionista),
    DEMO_RECEPCIONISTAS
  );
  return (
    <DataTable
      title="Recepcionistas" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" }, { key: "turno", label: "Turno" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}

export function AdministradoresPage() {
  const { data, loading, error } = useApiData(
    async () => (await administradoresService.getAll()).map(mapAdministrador),
    DEMO_ADMINISTRADORES
  );
  return (
    <DataTable
      title="Administradores" data={data} loading={loading} error={error}
      columns={[
        { key: "id", label: "ID" }, { key: "empleado", label: "Empleado" }, { key: "correo", label: "Correo" },
      ]}
      onNew={() => {}} onEdit={() => {}} onDelete={() => {}}
    />
  );
}
