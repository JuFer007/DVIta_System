import { useState, useEffect, useRef } from "react";
import { LogOut, ChevronRight, Bell, X, Mail, Calendar, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PAGE_NAMES: Record<string, string> = {
  dashboard:    "Dashboard",
  clientes:     "Clientes",
  empleados:    "Empleados",
  habitaciones: "Habitaciones",
  tipos:        "Tipos de Habitación",
  reservas:     "Reservas",
  pagos:        "Pagos",
  usuarios:     "Usuarios",
  horarios:     "Horarios",
  reportes:     "Reportes",
};

interface Notificacion {
  id: number;
  tipo: "reserva" | "consulta";
  fecha: string;
  leido: boolean;
  nombre: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
  // campos de reserva
  habitacion?: string;
  llegada?: string;
  salida?: string;
  noches?: number;
  total?: number;
  dni?: string;
}

// ── Servicio de email via EmailJS (API pública gratuita) ─────────────────────
async function enviarEmail(params: {
  to_email: string;
  to_name: string;
  from_name: string;
  message: string;
  subject: string;
}): Promise<boolean> {
  // Usamos EmailJS con parámetros de template
  // Servicio: gmail, Template configurado en emailjs.com
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "service_dvita",       // Reemplaza con tu service_id de EmailJS
        template_id: "template_reply",     // Reemplaza con tu template_id
        user_id: "YOUR_EMAILJS_PUBLIC_KEY",// Reemplaza con tu public key
        template_params: params,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface Props {
  page: string;
  onLogout: () => void;
}

export default function Topbar({ page, onLogout }: Props) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selected, setSelected] = useState<Notificacion | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones del localStorage
  const cargarNotifs = () => {
    try {
      const data = JSON.parse(localStorage.getItem("dvita_notificaciones") || "[]");
      setNotifs(data);
    } catch {
      setNotifs([]);
    }
  };

  useEffect(() => {
    cargarNotifs();
    // Polling cada 10 segundos para nuevas notificaciones
    const interval = setInterval(cargarNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
        setSelected(null);
        setSent(false);
      }
    };
    if (panelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  const noLeidas = notifs.filter((n) => !n.leido).length;

  const marcarLeido = (id: number) => {
    const updated = notifs.map((n) => n.id === id ? { ...n, leido: true } : n);
    setNotifs(updated);
    localStorage.setItem("dvita_notificaciones", JSON.stringify(updated));
  };

  const handleSelect = (n: Notificacion) => {
    setSelected(n);
    setSent(false);
    setReply("");
    marcarLeido(n.id);
  };

  const handleEnviarRespuesta = async () => {
    if (!selected || !reply.trim()) return;
    if (!selected.email) {
      setSent(true);
      return;
    }
    setSending(true);
    const ok = await enviarEmail({
      to_email: selected.email,
      to_name: selected.nombre,
      from_name: "Hospedaje D'Vita",
      subject: selected.tipo === "reserva"
        ? `Confirmación de tu reserva — Hospedaje D'Vita`
        : `Re: Tu consulta — Hospedaje D'Vita`,
      message: reply,
    });
    setSending(false);
    setSent(true);
  };

  const formatFecha = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("es-PE", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-gray-100 sticky top-0 z-10 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <span>Inicio</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium">{PAGE_NAMES[page] ?? page}</span>
      </div>

      <div className="flex items-center gap-2">

        {/* ── Campanita ── */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => { setPanelOpen((o) => !o); setSelected(null); setSent(false); }}
            className="relative w-9 h-9 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {noLeidas > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {noLeidas > 9 ? "9+" : noLeidas}
              </span>
            )}
          </button>

          {/* Panel de notificaciones */}
          {panelOpen && (
            <div className="absolute right-0 top-11 w-[380px] bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{ boxShadow: "0 20px 60px rgba(29,13,4,0.18), 0 0 0 1px rgba(201,169,110,0.10)" }}
            >
              {/* Header del panel */}
              <div className="flex items-center justify-between px-4 py-3 bg-brand-900 border-b border-brand-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-300" />
                  <h3 className="text-[13px] font-bold text-white">Notificaciones</h3>
                  {noLeidas > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {noLeidas} nuevas
                    </span>
                  )}
                </div>
                <button onClick={() => { setPanelOpen(false); setSelected(null); }}
                  className="text-brand-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex" style={{ height: "420px" }}>
                {/* Lista de notificaciones */}
                <div className={`flex flex-col overflow-y-auto border-r border-neutral-100 ${selected ? "w-[140px] flex-shrink-0" : "flex-1"}`}>
                  {notifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2 px-4 text-center">
                      <Bell className="w-8 h-8 opacity-30" />
                      <p className="text-[12px]">Sin notificaciones</p>
                    </div>
                  ) : notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className={`flex items-start gap-3 px-3 py-3 text-left border-b border-neutral-50 transition-colors hover:bg-brand-50 ${
                        selected?.id === n.id ? "bg-brand-50 border-l-2 border-l-brand-500" : ""
                      } ${!n.leido ? "bg-blue-50/50" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        n.tipo === "reserva" ? "bg-brand-100" : "bg-blue-100"
                      }`}>
                        {n.tipo === "reserva"
                          ? <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          : <Mail className="w-3.5 h-3.5 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold truncate ${!n.leido ? "text-neutral-900" : "text-neutral-600"}`}>
                          {n.nombre}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {n.tipo === "reserva" ? "Reserva" : "Consulta"}
                        </p>
                        <p className="text-[10px] text-neutral-300 mt-0.5">{formatFecha(n.fecha)}</p>
                        {!n.leido && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Panel de detalle y respuesta */}
                {selected && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                      {/* Tipo badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          selected.tipo === "reserva" ? "bg-brand-100 text-brand-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {selected.tipo === "reserva" ? "Solicitud de Reserva" : "Consulta"}
                        </span>
                        <span className="text-[10px] text-neutral-400">{formatFecha(selected.fecha)}</span>
                      </div>

                      {/* Info del cliente */}
                      <div className="mb-3">
                        <p className="text-[13px] font-bold text-neutral-800">{selected.nombre}</p>
                        {selected.email && <p className="text-[11px] text-neutral-400">{selected.email}</p>}
                        {selected.telefono && <p className="text-[11px] text-neutral-400">{selected.telefono}</p>}
                        {selected.dni && <p className="text-[11px] text-neutral-400">DNI: {selected.dni}</p>}
                      </div>

                      {/* Detalle reserva */}
                      {selected.tipo === "reserva" && (
                        <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 mb-3 text-[11px]">
                          <p className="font-bold text-brand-700 mb-1.5">Detalles de la reserva</p>
                          <div className="flex flex-col gap-1 text-neutral-600">
                            <div className="flex justify-between"><span>Habitación</span><span className="font-medium">{selected.habitacion}</span></div>
                            <div className="flex justify-between"><span>Llegada</span><span className="font-medium">{selected.llegada}</span></div>
                            <div className="flex justify-between"><span>Salida</span><span className="font-medium">{selected.salida}</span></div>
                            <div className="flex justify-between"><span>Noches</span><span className="font-medium">{selected.noches}</span></div>
                            <div className="flex justify-between font-bold text-brand-700"><span>Total est.</span><span>S/.{selected.total}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Mensaje consulta */}
                      {selected.tipo === "consulta" && selected.mensaje && (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-3">
                          <p className="text-[11px] font-bold text-neutral-500 mb-1">Mensaje:</p>
                          <p className="text-[12px] text-neutral-700 leading-relaxed">{selected.mensaje}</p>
                        </div>
                      )}
                    </div>

                    {/* Responder */}
                    <div className="border-t border-neutral-100 p-3 flex-shrink-0">
                      {sent ? (
                        <div className="flex items-center gap-2 text-[12px] text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          {selected.email ? "Correo enviado correctamente" : "Respuesta registrada"}
                        </div>
                      ) : (
                        <>
                          {!selected.email && (
                            <p className="text-[10px] text-amber-600 mb-1.5 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> Sin email — Solo se registrará la respuesta
                            </p>
                          )}
                          <textarea
                            rows={3}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder={`Responder a ${selected.nombre}…`}
                            className="w-full text-[12px] border border-neutral-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-brand-400 mb-2"
                          />
                          <button
                            onClick={handleEnviarRespuesta}
                            disabled={!reply.trim() || sending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold rounded-lg transition-colors disabled:opacity-40"
                          >
                            {sending
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enviando…</>
                              : <><Send className="w-3.5 h-3.5" />{selected.email ? "Enviar correo" : "Registrar respuesta"}</>
                            }
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.nombre?.charAt(0) ?? "U"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-800">{user?.nombre}</span>
            <span className="text-xs text-gray-400">Administrador</span>
          </div>
        </div>
        <button onClick={onLogout} title="Cerrar sesión"
          className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
