import DataTable from "../components/DataTable";

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
  DISPONIBLE:   { bg: "#edf7f2", color: "#2D7A4F" },
  OCUPADA:      { bg: "#fdf0f0", color: "#A33030" },
  MANTENIMIENTO:{ bg: "#fff8e1", color: "#B08620" },
  CONFIRMADA:   { bg: "#edf7f2", color: "#2D7A4F" },
  PENDIENTE:    { bg: "#fff8e1", color: "#B08620" },
  CANCELADA:    { bg: "#fdf0f0", color: "#A33030" },
  COMPLETADA:   { bg: "#eaf1f8", color: "#2A5F8B" },
});


// ═══════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════
const CLIENTES = [
  { id: 1, nombre: "María López",   apellidoP: "López",   apellidoM: "Ríos",   dni: "12345678", telefono: "987654321", email: "maria@gmail.com" },
  { id: 2, nombre: "Carlos Ruiz",   apellidoP: "Ruiz",    apellidoM: "Torres", dni: "23456789", telefono: "976543210", email: "carlos@gmail.com" },
  { id: 3, nombre: "Ana Torres",    apellidoP: "Torres",  apellidoM: "Vega",   dni: "34567890", telefono: "965432109", email: "ana@gmail.com" },
  { id: 4, nombre: "José Mamani",   apellidoP: "Mamani",  apellidoM: "Quispe", dni: "45678901", telefono: "954321098", email: "jose@gmail.com" },
];

export function ClientesPage() {
  return (
    <DataTable
      title="Clientes"
      badge
      data={CLIENTES}
      columns={[
        { key: "id",         label: "ID" },
        { key: "nombre",     label: "Nombre" },
        { key: "apellidoP",  label: "Ap. Paterno" },
        { key: "apellidoM",  label: "Ap. Materno" },
        { key: "dni",        label: "DNI" },
        { key: "telefono",   label: "Teléfono" },
        { key: "email",      label: "Email" },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// EMPLEADOS
// ═══════════════════════════════════════════════
const EMPLEADOS = [
  { id: 1, nombre: "Pedro Huamán",   apellidoP: "Huamán",  apellidoM: "García", dni: "11223344", telefono: "912345678" },
  { id: 2, nombre: "Rosa Condori",   apellidoP: "Condori", apellidoM: "Lima",   dni: "22334455", telefono: "923456789" },
  { id: 3, nombre: "Juan Quispe",    apellidoP: "Quispe",  apellidoM: "Callo",  dni: "33445566", telefono: "934567890" },
];

export function EmpleadosPage() {
  return (
    <DataTable
      title="Empleados"
      badge
      data={EMPLEADOS}
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


// ═══════════════════════════════════════════════
// HABITACIONES
// ═══════════════════════════════════════════════
const HABITACIONES = [
  { id: 1, numero: "101", tipo: "Estándar",  estado: "OCUPADA",      precio: "S/.60.00" },
  { id: 2, numero: "102", tipo: "Estándar",  estado: "DISPONIBLE",   precio: "S/.60.00" },
  { id: 3, numero: "201", tipo: "Suite",     estado: "DISPONIBLE",   precio: "S/.120.00"},
  { id: 4, numero: "202", tipo: "Suite",     estado: "MANTENIMIENTO",precio: "S/.120.00"},
  { id: 5, numero: "301", tipo: "Familiar",  estado: "OCUPADA",      precio: "S/.180.00"},
];

export function HabitacionesPage() {
  return (
    <DataTable
      title="Habitaciones"
      badge
      data={HABITACIONES}
      columns={[
        { key: "id",     label: "ID" },
        { key: "numero", label: "Nº" },
        { key: "tipo",   label: "Tipo" },
        { key: "estado", label: "Estado",  render: estadoPill },
        { key: "precio", label: "Precio" },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// TIPOS HABITACIÓN
// ═══════════════════════════════════════════════
const TIPOS = [
  { id: 1, descripcion: "Habitación cómoda con TV y baño privado",            precio: "S/.60.00"  },
  { id: 2, descripcion: "Suite con sala de estar y vista panorámica",          precio: "S/.120.00" },
  { id: 3, descripcion: "Habitación familiar con 3 camas y espacio adicional", precio: "S/.180.00" },
];

export function TiposPage() {
  return (
    <DataTable
      title="Tipos de Habitación"
      badge
      data={TIPOS}
      columns={[
        { key: "id",          label: "ID" },
        { key: "descripcion", label: "Descripción" },
        { key: "precio",      label: "Precio" },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// RESERVAS
// ═══════════════════════════════════════════════
const RESERVAS = [
  { id: 1, cliente: "María López",  habitacion: "101", empleado: "Pedro Huamán", fechaReserva: "2025-07-09", fechaIngreso: "2025-07-10", fechaSalida: "2025-07-13", estado: "CONFIRMADA" },
  { id: 2, cliente: "Carlos Ruiz",  habitacion: "201", empleado: "Rosa Condori", fechaReserva: "2025-07-08", fechaIngreso: "2025-07-09", fechaSalida: "2025-07-11", estado: "PENDIENTE"  },
  { id: 3, cliente: "Ana Torres",   habitacion: "301", empleado: "Pedro Huamán", fechaReserva: "2025-07-08", fechaIngreso: "2025-07-08", fechaSalida: "2025-07-10", estado: "COMPLETADA" },
];

export function ReservasPage() {
  return (
    <DataTable
      title="Reservas"
      badge
      data={RESERVAS}
      columns={[
        { key: "id",          label: "ID" },
        { key: "cliente",     label: "Cliente" },
        { key: "habitacion",  label: "Habitación" },
        { key: "empleado",    label: "Empleado" },
        { key: "fechaReserva",label: "F. Reserva" },
        { key: "fechaIngreso",label: "Ingreso" },
        { key: "fechaSalida", label: "Salida" },
        { key: "estado",      label: "Estado", render: estadoPill },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// PAGOS
// ═══════════════════════════════════════════════
const PAGOS = [
  { id: 1, reserva: "#1 – María López",  monto: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE"             },
  { id: 2, reserva: "#3 – Ana Torres",   monto: "S/.360.00", fecha: "2025-07-10", metodo: "TARJETA_CREDITO"  },
];

export function PagosPage() {
  return (
    <DataTable
      title="Pagos"
      badge
      data={PAGOS}
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


// ═══════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════
const USUARIOS = [
  { id: 1, empleado: "Pedro Huamán",  usuario: "pedro.huaman",  contrasena: "••••••••" },
  { id: 2, empleado: "Rosa Condori",  usuario: "rosa.condori",  contrasena: "••••••••" },
  { id: 3, empleado: "Juan Quispe",   usuario: "juan.quispe",   contrasena: "••••••••" },
];

export function UsuariosPage() {
  return (
    <DataTable
      title="Usuarios"
      badge
      data={USUARIOS}
      columns={[
        { key: "id",         label: "ID" },
        { key: "empleado",   label: "Empleado" },
        { key: "usuario",    label: "Usuario" },
        { key: "contrasena", label: "Contraseña" },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// RECEPCIONISTAS
// ═══════════════════════════════════════════════
const RECEPCIONISTAS = [
  { id: 1, empleado: "Rosa Condori", turno: "MAÑANA" },
  { id: 2, empleado: "Juan Quispe",  turno: "TARDE"  },
];

export function RecepcionistasPage() {
  return (
    <DataTable
      title="Recepcionistas"
      badge
      data={RECEPCIONISTAS}
      columns={[
        { key: "id",       label: "ID" },
        { key: "empleado", label: "Empleado" },
        { key: "turno",    label: "Turno" },
      ]}
    />
  );
}


// ═══════════════════════════════════════════════
// ADMINISTRADORES
// ═══════════════════════════════════════════════
const ADMINISTRADORES = [
  { id: 1, empleado: "Pedro Huamán", correo: "pedro.admin@dvita.pe" },
];

export function AdministradoresPage() {
  return (
    <DataTable
      title="Administradores"
      badge
      data={ADMINISTRADORES}
      columns={[
        { key: "id",       label: "ID" },
        { key: "empleado", label: "Empleado" },
        { key: "correo",   label: "Correo electrónico" },
      ]}
    />
  );
}
