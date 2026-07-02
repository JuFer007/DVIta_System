import { BASE_URL, getAuthToken } from "./api";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getAuthToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

export interface ClienteData {
  idCliente?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  telefono: string;
  email: string;
  esNuevo: boolean;
}

export async function buscarClienteEnBD(dni: string): Promise<ClienteData | null> {
  try {
    const res = await fetch(`${BASE_URL}/clientes/dni/${dni}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const c = await res.json();
    return {
      idCliente: c.idCliente,
      nombre: c.nombre ?? "",
      apellidoPaterno: c.apellidoPaterno ?? "",
      apellidoMaterno: c.apellidoMaterno ?? "",
      dni: c.dni,
      telefono: c.telefono ?? "",
      email: c.email ?? "",
      esNuevo: false,
    };
  } catch {
    return null;
  }
}

export async function buscarEnReniec(dni: string): Promise<Partial<ClienteData> | null> {
  try {
    const res = await fetch(`${BASE_URL}/reniec/dni/${dni}`, { headers: authHeaders() });
    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.nombres) return null;

    return {
      nombre: data.nombres ?? "",
      apellidoPaterno: data.apellidoPaterno ?? "",
      apellidoMaterno: data.apellidoMaterno ?? "",
      dni,
      esNuevo: true,
    };
  } catch {
    return null;
  }
}

export async function crearCliente(payload: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  telefono: string;
  email: string | null;
}): Promise<number> {
  const res = await fetch(`${BASE_URL}/clientes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idCliente as number;
}

export async function buscarTiposHabitacion(): Promise<{ idTipoHabitacion: number; descripcion: string; precio: number }[]> {
  try {
    const res = await fetch(`${BASE_URL}/tipos-habitacion`, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function buscarHabitacionDisponible(
  tipoId: number, fechaIngreso: string, fechaSalida: string
): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/habitaciones/disponibles?fechaIngreso=${fechaIngreso}&fechaSalida=${fechaSalida}&tipoId=${tipoId}`, { headers: authHeaders() });
    if (!res.ok) return null;
    const habs: any[] = await res.json();
    const match = habs.find((h) => h.estado !== "MANTENIMIENTO");
    return match ? (match.idHabitacion as number) : null;
  } catch {
    return null;
  }
}

export async function crearReserva(payload: {
  cliente: { idCliente: number };
  habitacion: { idHabitacion: number };
  fechaReserva: string;
  fechaIngreso: string;
  fechaSalida: string;
  estadoReserva: string;
}): Promise<number> {
  const res = await fetch(`${BASE_URL}/reservas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idReserva as number;
}

export async function crearReservaConDni(payload: {
  idCliente?: number;
  dniCliente?: string;
  nombreCliente?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefonoCliente?: string;
  emailCliente?: string;
  idHabitacion: number;
  idEmpleado?: number;
  fechaReserva: string;
  fechaIngreso: string;
  fechaSalida: string;
  estadoReserva: string;
}): Promise<number> {
  const res = await fetch(`${BASE_URL}/reservas/con-dni`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idReserva as number;
}

export async function buscarEmpleadoChatbot(): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/empleados/chatbot`, { headers: authHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.idEmpleado as number) ?? null;
  } catch {
    return null;
  }
}
