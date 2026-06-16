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
};

// ── Empleados ─────────────────────────────────
export const empleadosService = {
  getAll:  ()                   => request<any[]>("empleados"),
  create:  (data: any)          => request("empleados",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`empleados/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Habitaciones ──────────────────────────────
export const habitacionesService = {
  getAll:         ()                    => request<any[]>("habitaciones"),
  getDisponibles: (ingreso: string, salida: string, tipoId?: number) =>
    request<any[]>(`habitaciones/disponibles?fechaIngreso=${ingreso}&fechaSalida=${salida}${tipoId ? `&tipoId=${tipoId}` : ""}`),
  create:         (data: any)           => request("habitaciones",     { method: "POST", body: JSON.stringify(data) }),
  update:         (id: number, data: any) => request(`habitaciones/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  cambiarEstado:  (id: number, estado: string) =>
    request(`habitaciones/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }),
};

// ── Tipos Habitación ──────────────────────────
export const tiposService = {
  getAll:  ()                   => request<any[]>("tipos-habitacion"),
  create:  (data: any)          => request("tipos-habitacion",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`tipos-habitacion/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Reservas ──────────────────────────────────
export const reservasService = {
  getAll:     ()                    => request<any[]>("reservas"),
  create:     (data: any)           => request("reservas",     { method: "POST", body: JSON.stringify(data) }),
  createWithDni: (data: any)        => request("reservas/con-dni", { method: "POST", body: JSON.stringify(data) }),
  update:     (id: number, data: any) => request(`reservas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  checkIn:    (id: number)          => request(`reservas/${id}/checkin`,  { method: "PATCH" }),
  checkOut:   (id: number)          => request(`reservas/${id}/checkout`, { method: "PATCH" }),
  cancelar:   (id: number)          => request(`reservas/${id}/cancelar`, { method: "PATCH" }),
};

// ── Pagos ─────────────────────────────────────
export const pagosService = {
  getAll:  ()                   => request<any[]>("pagos"),
  create:  (data: any)          => request("pagos",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`pagos/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Usuarios ──────────────────────────────────
export const usuariosService = {
  getAll:  ()                   => request<any[]>("usuarios"),
  create:  (data: any)          => request("usuarios",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`usuarios/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Recepcionistas ────────────────────────────
export const recepcionistasService = {
  getAll:  ()                   => request<any[]>("recepcionistas"),
  create:  (data: any)          => request("recepcionistas",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`recepcionistas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Administradores ───────────────────────────
export const administradoresService = {
  getAll:  ()                   => request<any[]>("administradores"),
  create:  (data: any)          => request("administradores",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`administradores/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Incidencias ───────────────────────────────
export const incidenciasService = {
  getAll:  ()                    => request<any[]>("incidencias"),
  getById: (id: number)          => request<any>(`incidencias/${id}`),
  create:  (data: any)           => request("incidencias",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`incidencias/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  cambiarEstado: (id: number, estado: string, solucion?: string, notasAuditoria?: string, idEmpleadoResuelve?: number) => request(`incidencias/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado, solucion, notasAuditoria, idEmpleadoResuelve }) }),
  getRecurrentes: (habitacionId: number, tipo: string) => request<any[]>(`incidencias/recurrentes?habitacion=${habitacionId}&tipo=${encodeURIComponent(tipo)}`),
  getResoluciones: (id: number) => request<any[]>(`incidencias/${id}/resoluciones`),
  crearResolucion: (id: number, data: any) => request(`incidencias/${id}/resoluciones`, { method: "POST", body: JSON.stringify(data) }),
};

// ── PDF Download ──────────────────────────────
export async function downloadPdf(url: string, _filename?: string) {
  window.dispatchEvent(new CustomEvent("pdf-loading-start"));
  const newTab = window.open("about:blank", "_blank");
  try {
    const res = await fetch(url);
    if (!res.ok) {
      let msg = `Error al generar PDF (${res.status})`;
      try { const body = await res.text(); if (body) msg = body; } catch {}
      throw new Error(msg);
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (newTab && !newTab.closed) {
      newTab.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank");
    }
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      window.dispatchEvent(new CustomEvent("pdf-loading-end"));
    }, 3000);
  } catch (e) {
    console.error("PDF error:", e);
    if (newTab && !newTab.closed) newTab.close();
    window.dispatchEvent(new CustomEvent("pdf-loading-end"));
  }
}

// ── Áreas ────────────────────────────────────
export const areasService = {
  getAll:  ()                   => request<any[]>("areas"),
  getAllAdmin: ()               => request<any[]>("areas/todas"),
  create:  (data: any)          => request("areas",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`areas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

// ── Permisos ──────────────────────────────────
export const permisosService = {
  getByUsuario: (id: number)     => request<any[]>(`permisos/usuario/${id}`),
  update:       (id: number, data: any[]) =>
    request(`permisos/usuario/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ── RENIEC ────────────────────────────────────
export const reniecService = {
  consultar: (dni: string) => request<any>(`reniec/dni/${dni}`),
};