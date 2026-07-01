export const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    headers,
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

export const authService = {
  login: (nombreUsuario: string, contrasena: string) =>
    request<{ token: string; user: { idUsuario: number; nombreUsuario: string; nombre: string; idEmpleado: number | null; cargo: string; permisos: Record<string, boolean> } }>("auth/login", {
      method: "POST",
      body: JSON.stringify({ nombreUsuario, contrasena }),
    }),
  getUsuarios: () => request<any[]>("usuarios"),
  getEmpleado: (id: number) => request<any>(`empleados/${id}`),
};

export const dashboardService = {
  getStats:            () => request<any>("dashboard/stats"),
  getReservasRecientes:() => request<any[]>("dashboard/reservas-recientes"),
  getHabitacionesEstado:()=> request<any[]>("dashboard/habitaciones-estado"),
  getIngresosMensuales:() => request<any[]>("dashboard/ingresos-mensuales"),
  getReservasPorEstado:() => request<any>("dashboard/reservas-por-estado"),
  getMetodosPago:      () => request<any[]>("dashboard/metodos-pago"),
  getOcupacionPorTipo: () => request<any[]>("dashboard/ocupacion-por-tipo"),
};

export const clientesService = {
  getAll:   ()                    => request<any[]>("clientes"),
  getByDni: (dni: string)         => request<any>(`clientes/dni/${dni}`),
  create:   (data: any)           => request("clientes",     { method: "POST", body: JSON.stringify(data) }),
  update:   (id: number, data: any) => request(`clientes/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const empleadosService = {
  getAll:  ()                   => request<any[]>("empleados"),
  create:  (data: any)          => request("empleados",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`empleados/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const habitacionesService = {
  getAll:         ()                    => request<any[]>("habitaciones"),
  getDisponibles: (ingreso: string, salida: string, tipoId?: number) =>
    request<any[]>(`habitaciones/disponibles?fechaIngreso=${ingreso}&fechaSalida=${salida}${tipoId ? `&tipoId=${tipoId}` : ""}`),
  create:         (data: any)           => request("habitaciones",     { method: "POST", body: JSON.stringify(data) }),
  update:         (id: number, data: any) => request(`habitaciones/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  cambiarEstado:  (id: number, estado: string) =>
    request(`habitaciones/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }),
};

export const tiposService = {
  getAll:  ()                   => request<any[]>("tipos-habitacion"),
  create:  (data: any)          => request("tipos-habitacion",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`tipos-habitacion/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const reservasService = {
  getAll:     ()                    => request<any[]>("reservas"),
  create:     (data: any)           => request("reservas",     { method: "POST", body: JSON.stringify(data) }),
  createWithDni: (data: any)        => request("reservas/con-dni", { method: "POST", body: JSON.stringify(data) }),
  update:     (id: number, data: any) => request(`reservas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  checkIn:    (id: number)          => request(`reservas/${id}/checkin`,  { method: "PATCH" }),
  checkOut:   (id: number)          => request(`reservas/${id}/checkout`, { method: "PATCH" }),
  cancelar:   (id: number)          => request(`reservas/${id}/cancelar`, { method: "PATCH" }),
};

export const pagosService = {
  getAll:    ()                       => request<any[]>("pagos"),
  create:    (data: any)              => request("pagos",     { method: "POST", body: JSON.stringify(data) }),
  update:    (id: number, data: any)  => request(`pagos/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
  completar: (id: number, data: any)  => request(`pagos/${id}/completar`, { method: "PUT", body: JSON.stringify(data) }),
};

export const usuariosService = {
  getAll:  ()                   => request<any[]>("usuarios"),
  create:  (data: any)          => request("usuarios",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`usuarios/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const recepcionistasService = {
  getAll:  ()                   => request<any[]>("recepcionistas"),
  create:  (data: any)          => request("recepcionistas",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`recepcionistas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const administradoresService = {
  getAll:  ()                   => request<any[]>("administradores"),
  create:  (data: any)          => request("administradores",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`administradores/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

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

export async function downloadPdf(url: string, _filename?: string) {
  window.dispatchEvent(new CustomEvent("pdf-loading-start"));
  try {
    const res = await fetch(url);
    const ct = res.headers.get("content-type") || "";
    console.log("PDF response:", res.status, ct, res.url);
    if (!res.ok) {
      let msg = `Error al generar PDF (${res.status})`;
      try { const body = await res.text(); if (body) msg = body; } catch {}
      window.dispatchEvent(new CustomEvent("pdf-loading-error", { detail: msg }));
      throw new Error(msg);
    }
    if (!ct.includes("application/pdf")) {
      const body = await res.text();
      console.error("Respuesta no es PDF:", body.slice(0, 300));
      window.dispatchEvent(new CustomEvent("pdf-loading-error", { detail: "El servidor no devolvió un PDF. Revisa la consola para más detalles." }));
      throw new Error("Respuesta no es PDF: " + ct);
    }
    const blob = await res.blob();
    console.log("PDF blob:", blob.size, "bytes");
    const blobUrl = URL.createObjectURL(blob);
    const newTab = window.open(blobUrl, "_blank");
    if (!newTab || newTab.closed) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = _filename || "documento.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    window.dispatchEvent(new CustomEvent("pdf-loading-end"));
  } catch (e) {
    console.error("PDF error:", e);
    window.dispatchEvent(new CustomEvent("pdf-loading-end"));
  }
}

export const areasService = {
  getAll:  ()                   => request<any[]>("areas"),
  getAllAdmin: ()               => request<any[]>("areas/todas"),
  create:  (data: any)          => request("areas",     { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: any) => request(`areas/${id}`, { method: "PUT",  body: JSON.stringify(data) }),
};

export const permisosService = {
  getByUsuario: (id: number)     => request<any[]>(`permisos/usuario/${id}`),
  update:       (id: number, data: any[]) =>
    request(`permisos/usuario/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const reniecService = {
  consultar: (dni: string) => request<any>(`reniec/dni/${dni}`),
};

export async function verificarAccesoHorario(idEmpleado: number): Promise<{ acceso: boolean; mensaje: string }> {
  return request(`horarios/verificar-acceso/${idEmpleado}`);
}