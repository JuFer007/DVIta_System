const BASE_URL = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `Error del servidor (${res.status})`;
    try {
      const body = await res.text();
      if (body) {
        try {
          const json = JSON.parse(body);
          msg = json.message || json.error || body;
        } catch {
          msg = body;
        }
      }
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────
export const authService = {
  getUsuarios: () => request<any[]>("usuarios"),
  getEmpleado: (id: number) => request<any>(`empleados/${id}`),
};

// ── Dashboard ─────────────────────────────────
export const dashboardService = {
  getStats:            () => request<any>("dashboard/stats"),
  getReservasRecientes:() => request<any[]>("dashboard/reservas-recientes"),
  getHabitacionesEstado:()=> request<any[]>("dashboard/habitaciones-estado"),
  getIngresosMensuales:() => request<any[]>("dashboard/ingresos-mensuales"),
  getReservasPorEstado:() => request<any>("dashboard/reservas-por-estado"),
  getMetodosPago:      () => request<any[]>("dashboard/metodos-pago"),
  getOcupacionPorTipo: () => request<any[]>("dashboard/ocupacion-por-tipo"),
};

// ── Clientes ──────────────────────────────────
export const clientesService = {
  getAll:   ()                    => request<any[]>("clientes"),
  getByDni: (dni: string)         => request<any>(`clientes/dni/${dni}`),
  create:   (data: any)           => request("clientes",     { method: "POST", body: JSON.stringify(data) }),
  update:   (id: number, data: any) => request(`clientes/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:   (id: number)          => request(`clientes/${id}`, { method: "DELETE" }),
};

// ── Empleados ─────────────────────────────────
export const empleadosService = {
  getAll:  ()                   => request<any[]>("empleados"),
  create:  (data: any)          => request("empleados",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`empleados/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`empleados/${id}`, { method: "DELETE" }),
};

// ── Habitaciones ──────────────────────────────
export const habitacionesService = {
  getAll:         ()                    => request<any[]>("habitaciones"),
  getDisponibles: (ingreso: string, salida: string, tipoId?: number) =>
    request<any[]>(`habitaciones/disponibles?fechaIngreso=${ingreso}&fechaSalida=${salida}${tipoId ? `&tipoId=${tipoId}` : ""}`),
  create:         (data: any)           => request("habitaciones",     { method: "POST", body: JSON.stringify(data) }),
  update:         (id: number, data: any) => request(`habitaciones/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:         (id: number)          => request(`habitaciones/${id}`, { method: "DELETE" }),
  cambiarEstado:  (id: number, estado: string) =>
    request(`habitaciones/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }),
};

// ── Tipos Habitación ──────────────────────────
export const tiposService = {
  getAll:  ()                   => request<any[]>("tipos-habitacion"),
  create:  (data: any)          => request("tipos-habitacion",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`tipos-habitacion/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`tipos-habitacion/${id}`, { method: "DELETE" }),
};

// ── Reservas ──────────────────────────────────
export const reservasService = {
  getAll:     ()                    => request<any[]>("reservas"),
  create:     (data: any)           => request("reservas",     { method: "POST", body: JSON.stringify(data) }),
  createWithDni: (data: any)        => request("reservas/con-dni", { method: "POST", body: JSON.stringify(data) }),
  update:     (id: number, data: any) => request(`reservas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:     (id: number)          => request(`reservas/${id}`, { method: "DELETE" }),
  checkIn:    (id: number)          => request(`reservas/${id}/checkin`,  { method: "PATCH" }),
  checkOut:   (id: number)          => request(`reservas/${id}/checkout`, { method: "PATCH" }),
  cancelar:   (id: number)          => request(`reservas/${id}/cancelar`, { method: "PATCH" }),
};

// ── Pagos ─────────────────────────────────────
export const pagosService = {
  getAll:  ()                   => request<any[]>("pagos"),
  create:  (data: any)          => request("pagos",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`pagos/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`pagos/${id}`, { method: "DELETE" }),
};

// ── Usuarios ──────────────────────────────────
export const usuariosService = {
  getAll:  ()                   => request<any[]>("usuarios"),
  create:  (data: any)          => request("usuarios",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`usuarios/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`usuarios/${id}`, { method: "DELETE" }),
};

// ── Recepcionistas ────────────────────────────
export const recepcionistasService = {
  getAll:  ()                   => request<any[]>("recepcionistas"),
  create:  (data: any)          => request("recepcionistas",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`recepcionistas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`recepcionistas/${id}`, { method: "DELETE" }),
};

// ── Administradores ───────────────────────────
export const administradoresService = {
  getAll:  ()                   => request<any[]>("administradores"),
  create:  (data: any)          => request("administradores",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`administradores/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  delete:  (id: number)         => request(`administradores/${id}`, { method: "DELETE" }),
};

// ── RENIEC ────────────────────────────────────
export const reniecService = {
  consultar: (dni: string) => request<any>(`reniec/dni/${dni}`),
};
