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
    const res = await fetch("/api/clientes");
    if (!res.ok) return null;
    const clientes: any[] = await res.json();
    const c = clientes.find((x) => x.dni === dni);
    if (!c) return null;
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
    const res = await fetch(`/api/reniec/dni/${dni}`);
    if (!res.ok) return null;

    const data = await res.json();

    if (!data?.first_name) return null;

    return {
      nombre: data.first_name ?? "",
      apellidoPaterno: data.first_last_name ?? "",
      apellidoMaterno: data.second_last_name ?? "",
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
  const res = await fetch("/api/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idCliente as number;
}
 
export async function buscarHabitacionDisponible(tipoLabel: string): Promise<number | null> {
  try {
    const res = await fetch("/api/habitaciones");
    if (!res.ok) return null;
    const habs: any[] = await res.json();
    const match = habs.find(
      (h) =>
        h.estado === "DISPONIBLE" &&
        (h.tipoHabitacion?.descripcion ?? "")
          .toLowerCase()
          .includes(tipoLabel.toLowerCase())
    );
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
  const res = await fetch("/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idReserva as number;
}
 
/** Crea el pago pendiente vinculado a la reserva */
export async function crearPago(
  idReserva: number,
  monto: number,
  fechaPago: string
): Promise<number | undefined> {
  const res = await fetch("/api/pagos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reserva: { idReserva },
      monto,
      fechaPago,
      metodoPago: "EFECTIVO",
    }),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  const data = await res.json();
  return data.idPago as number | undefined;
}
 