// frontend/src/pages/EntityPages.tsx
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";

const API = "http://localhost:8080/api";

const pill = (colors: Record<string, { bg: string; color: string }>) =>
  (val: string) => {
    const c = colors[val] || { bg: "#f3f4f6", color: "#6b7280" };
    return (
      <span style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: ".72rem",
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        whiteSpace: "nowrap",
      }}>
        {val}
      </span>
    );
  };

const estadoPill = pill({
  DISPONIBLE:    { bg: "#edf7f2", color: "#2D7A4F" },
  OCUPADA:       { bg: "#fdf0f0", color: "#A33030" },
  MANTENIMIENTO: { bg: "#fff8e1", color: "#B08620" },
  CONFIRMADA:    { bg: "#edf7f2", color: "#2D7A4F" },
  PENDIENTE:     { bg: "#fff8e1", color: "#B08620" },
  CANCELADA:     { bg: "#fdf0f0", color: "#A33030" },
  COMPLETADA:    { bg: "#eaf1f8", color: "#2A5F8B" },
});

/* ─── Hook genérico para fetch ─── */
function useApiData<T>(endpoint: string, fallback: T[], mapper?: (item: any) => any) {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/${endpoint}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: any[]) => setData(mapper ? d.map(mapper) : d))
      .catch(() => setData(fallback))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
}

/* ─── CLIENTES ─── */
const CLIENTES_DEMO = [
  { id: 1, nombre: "María López",  apellidoP: "López",  apellidoM: "Ríos",   dni: "12345678", telefono: "987654321", email: "maria@gmail.com" },
  { id: 2, nombre: "Carlos Ruiz",  apellidoP: "Ruiz",   apellidoM: "Torres", dni: "23456789", telefono: "976543210", email: "carlos@gmail.com" },
  { id: 3, nombre: "Ana Torres",   apellidoP: "Torres", apellidoM: "Vega",   dni: "34567890", telefono: "965432109", email: "ana@gmail.com" },
];

export function ClientesPage() {
  const { data, loading } = useApiData("clientes", CLIENTES_DEMO, (c: any) => ({
    id: c.idCliente,
    nombre: c.nombre,
    apellidoP: c.apellidoPaterno,
    apellidoM: c.apellidoMaterno,
    dni: c.dni,
    telefono: c.telefono,
    email: c.email || "—",
  }));

  return (
    <DataTable
      title={loading ? "Clientes (cargando…)" : "Clientes"}
      badge
      data={data}
      columns={[
        { key: "id",        label: "ID" },
        { key: "nombre",    label: "Nombre" },
        { key: "apellidoP", label: "Ap. Paterno" },
        { key: "apellidoM", label: "Ap. Materno" },
        { key: "dni",       label: "DNI" },
        { key: "telefono",  label: "Teléfono" },
        { key: "email",     label: "Email" },
      ]}
    />
  );
}

/* ─── EMPLEADOS ─── */
const EMPLEADOS_DEMO = [
  { id: 1, nombre: "Pedro Huamán", apellidoP: "Huamán",  apellidoM: "García", dni: "11223344", telefono: "912345678" },
  { id: 2, nombre: "Rosa Condori", apellidoP: "Condori", apellidoM: "Lima",   dni: "22334455", telefono: "923456789" },
  { id: 3, nombre: "Juan Quispe",  apellidoP: "Quispe",  apellidoM: "Callo",  dni: "33445566", telefono: "934567890" },
];

export function EmpleadosPage() {
  const { data, loading } = useApiData("empleados", EMPLEADOS_DEMO, (e: any) => ({
    id: e.idEmpleado,
    nombre: e.nombre,
    apellidoP: e.apellidoP,
    apellidoM: e.apellidoM,
    dni: e.dni,
    telefono: e.telefono,
  }));

  return (
    <DataTable
      title={loading ? "Empleados (cargando…)" : "Empleados"}
      badge
      data={data}
      columns={[
        { key: "id",        label: "ID" },
        { key: "nombre",    label: "Nombre" },
        { key: "apellidoP", label: "Ap. Paterno" },
        { key: "apellidoM", label: "Ap. Materno" },
        { key: "dni",       label: "DNI" },
        { key: "telefono",  label: "Teléfono" },
      ]}
    />
  );
}

/* ─── HABITACIONES ─── */
const HABITACIONES_DEMO = [
  { id: 1, numero: "101", tipo: "Estándar",  estado: "OCUPADA",       precio: "S/.60.00" },
  { id: 2, numero: "102", tipo: "Estándar",  estado: "DISPONIBLE",    precio: "S/.60.00" },
  { id: 3, numero: "201", tipo: "Suite",     estado: "DISPONIBLE",    precio: "S/.120.00" },
  { id: 4, numero: "202", tipo: "Suite",     estado: "MANTENIMIENTO", precio: "S/.120.00" },
  { id: 5, numero: "301", tipo: "Familiar",  estado: "OCUPADA",       precio: "S/.180.00" },
];

export function HabitacionesPage() {
  const { data, loading } = useApiData("habitaciones", HABITACIONES_DEMO, (h: any) => ({
    id: h.idHabitacion,
    numero: String(h.numeroHabitacion),
    tipo: h.tipoHabitacion?.descripcion || "—",
    estado: h.estado,
    precio: `S/.${Number(h.precio).toFixed(2)}`,
  }));

  return (
    <DataTable
      title={loading ? "Habitaciones (cargando…)" : "Habitaciones"}
      badge
      data={data}
      columns={[
        { key: "id",     label: "ID" },
        { key: "numero", label: "Nº" },
        { key: "tipo",   label: "Tipo" },
        { key: "estado", label: "Estado", render: estadoPill },
        { key: "precio", label: "Precio" },
      ]}
    />
  );
}

/* ─── TIPOS HABITACIÓN ─── */
const TIPOS_DEMO = [
  { id: 1, descripcion: "Habitación cómoda con TV y baño privado",            precio: "S/.60.00" },
  { id: 2, descripcion: "Suite con sala de estar y vista panorámica",          precio: "S/.120.00" },
  { id: 3, descripcion: "Habitación familiar con 3 camas y espacio adicional", precio: "S/.180.00" },
];

export function TiposPage() {
  const { data, loading } = useApiData("tipos-habitacion", TIPOS_DEMO, (t: any) => ({
    id: t.idTipoHabitacion,
    descripcion: t.descripcion,
    precio: `S/.${Number(t.precio).toFixed(2)}`,
  }));

  return (
    <DataTable
      title={loading ? "Tipos de Habitación (cargando…)" : "Tipos de Habitación"}
      badge
      data={data}
      columns={[
        { key: "id",          label: "ID" },
        { key: "descripcion", label: "Descripción" },
        { key: "precio",      label: "Precio" },
      ]}
    />
  );
}

/* ─── RESERVAS ─── */
const RESERVAS_DEMO = [
  { id: 1, cliente: "María López", habitacion: "101", empleado: "Pedro Huamán", fechaReserva: "2025-07-09", fechaIngreso: "2025-07-10", fechaSalida: "2025-07-13", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz", habitacion: "201", empleado: "Rosa Condori", fechaReserva: "2025-07-08", fechaIngreso: "2025-07-09", fechaSalida: "2025-07-11", estado: "PENDIENTE" },
  { id: 3, cliente: "Ana Torres",  habitacion: "301", empleado: "Pedro Huamán", fechaReserva: "2025-07-08", fechaIngreso: "2025-07-08", fechaSalida: "2025-07-10", estado: "COMPLETADA" },
];

export function ReservasPage() {
  const { data, loading } = useApiData("reservas", RESERVAS_DEMO, (r: any) => ({
    id: r.idReserva,
    cliente: `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
    habitacion: String(r.habitacion?.numeroHabitacion || "—"),
    empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
    fechaReserva: r.fechaReserva,
    fechaIngreso: r.fechaIngreso,
    fechaSalida: r.fechaSalida,
    estado: r.estadoReserva,
  }));

  return (
    <DataTable
      title={loading ? "Reservas (cargando…)" : "Reservas"}
      badge
      data={data}
      columns={[
        { key: "id",           label: "ID" },
        { key: "cliente",      label: "Cliente" },
        { key: "habitacion",   label: "Habitación" },
        { key: "empleado",     label: "Empleado" },
        { key: "fechaReserva", label: "F. Reserva" },
        { key: "fechaIngreso", label: "Ingreso" },
        { key: "fechaSalida",  label: "Salida" },
        { key: "estado",       label: "Estado", render: estadoPill },
      ]}
    />
  );
}

/* ─── PAGOS ─── */
const PAGOS_DEMO = [
  { id: 1, reserva: "#1 – María López", monto: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE" },
  { id: 2, reserva: "#3 – Ana Torres",  monto: "S/.360.00", fecha: "2025-07-10", metodo: "TARJETA_CREDITO" },
];

export function PagosPage() {
  const { data, loading } = useApiData("pagos", PAGOS_DEMO, (p: any) => {
    const cliente = p.reserva?.cliente;
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellidoPaterno}`.trim() : "—";
    return {
      id: p.idPago,
      reserva: `#${p.reserva?.idReserva || "?"} – ${nombreCliente}`,
      monto: `S/.${Number(p.monto).toFixed(2)}`,
      fecha: p.fechaPago,
      metodo: p.metodoPago,
    };
  });

  return (
    <DataTable
      title={loading ? "Pagos (cargando…)" : "Pagos"}
      badge
      data={data}
      columns={[
        { key: "id",      label: "ID" },
        { key: "reserva", label: "Reserva" },
        { key: "monto",   label: "Monto" },
        { key: "fecha",   label: "Fecha" },
        { key: "metodo",  label: "Método" },
      ]}
    />
  );
}

/* ─── USUARIOS ─── */
const USUARIOS_DEMO = [
  { id: 1, empleado: "Pedro Huamán", usuario: "pedro.huaman", contrasena: "••••••••" },
  { id: 2, empleado: "Rosa Condori", usuario: "rosa.condori", contrasena: "••••••••" },
  { id: 3, empleado: "Juan Quispe",  usuario: "juan.quispe",  contrasena: "••••••••" },
];

export function UsuariosPage() {
  const { data, loading } = useApiData("usuarios", USUARIOS_DEMO, (u: any) => ({
    id: u.idUsuario,
    empleado: `${u.empleado?.nombre || ""} ${u.empleado?.apellidoP || ""}`.trim() || "—",
    usuario: u.nombreUsuario,
    contrasena: "••••••••",
  }));

  return (
    <DataTable
      title={loading ? "Usuarios (cargando…)" : "Usuarios"}
      badge
      data={data}
      columns={[
        { key: "id",         label: "ID" },
        { key: "empleado",   label: "Empleado" },
        { key: "usuario",    label: "Usuario" },
        { key: "contrasena", label: "Contraseña" },
      ]}
    />
  );
}

/* ─── RECEPCIONISTAS ─── */
const RECEPCIONISTAS_DEMO = [
  { id: 1, empleado: "Rosa Condori", turno: "MAÑANA" },
  { id: 2, empleado: "Juan Quispe",  turno: "TARDE" },
];

export function RecepcionistasPage() {
  const { data, loading } = useApiData("recepcionistas", RECEPCIONISTAS_DEMO, (r: any) => ({
    id: r.idRecepcionista,
    empleado: `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
    turno: r.turnoTrabajo,
  }));

  return (
    <DataTable
      title={loading ? "Recepcionistas (cargando…)" : "Recepcionistas"}
      badge
      data={data}
      columns={[
        { key: "id",       label: "ID" },
        { key: "empleado", label: "Empleado" },
        { key: "turno",    label: "Turno" },
      ]}
    />
  );
}

/* ─── ADMINISTRADORES ─── */
const ADMINISTRADORES_DEMO = [
  { id: 1, empleado: "Pedro Huamán", correo: "pedro.admin@dvita.pe" },
];

export function AdministradoresPage() {
  const { data, loading } = useApiData("administradores", ADMINISTRADORES_DEMO, (a: any) => ({
    id: a.idAdministrador,
    empleado: `${a.empleado?.nombre || ""} ${a.empleado?.apellidoP || ""}`.trim() || "—",
    correo: a.correoElectronico,
  }));

  return (
    <DataTable
      title={loading ? "Administradores (cargando…)" : "Administradores"}
      badge
      data={data}
      columns={[
        { key: "id",       label: "ID" },
        { key: "empleado", label: "Empleado" },
        { key: "correo",   label: "Correo electrónico" },
      ]}
    />
  );
}
