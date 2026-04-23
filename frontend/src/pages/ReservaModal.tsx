import { useState } from "react";
import {
  X, CalendarDays, User, Phone, BedDouble, ChevronRight,
  CheckCircle2, Search, Loader2, Mail, AlertCircle, MapPin
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
  initialRoom?: string;
}

const ROOMS = [
  { value: "estandar", label: "Habitación Estándar", price: 60,  features: ["TV Cable", "Baño privado", "WiFi"] },
  { value: "suite",    label: "Suite Deluxe",        price: 120, features: ['TV 50"', "Sala de estar", "Mini bar"] },
  { value: "familiar", label: "Habitación Familiar", price: 180, features: ["3 camas", "Área adicional", "Frigobar"] },
];

type Step = 1 | 2 | 3;

// ── DNI lookup ────────────────────────────────────────────────────────────────
async function buscarClienteEnBD(dni: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/clientes`);
    if (!res.ok) return null;
    const clientes: any[] = await res.json();
    return clientes.find((c) => c.dni === dni) || null;
  } catch {
    return null;
  }
}

async function buscarEnReniec(dni: string): Promise<any | null> {
  // API pública de consulta de DNI (reniec-like)
  // Usamos la API de https://api.apis.net.pe/v2/reniec/dni
  try {
    const res = await fetch(`https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`, {
      headers: { Authorization: "Bearer apis-token-14647.bk9a6OZjm8Y9eEsT8oZq5X7ywTRpYf3H" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.nombre) return null;
    return data;
  } catch {
    return null;
  }
}

export default function ReservaModal({ open, onClose, initialRoom = "estandar" }: Props) {
  const [step, setStep] = useState<Step>(1);

  // Paso 1: habitación y fechas
  const [habitacion, setHabitacion] = useState(initialRoom);
  const [llegada,    setLlegada]    = useState("");
  const [salida,     setSalida]     = useState("");

  // Paso 2: datos del cliente
  const [dni,       setDni]       = useState("");
  const [nombre,    setNombre]    = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [email,     setEmail]     = useState("");
  const [adultos,   setAdultos]   = useState("1");
  const [notas,     setNotas]     = useState("");
  const [dniLoading, setDniLoading] = useState(false);
  const [dniError,   setDniError]   = useState("");
  const [dniFound,   setDniFound]   = useState<"bd" | "reniec" | null>(null);

  // Paso 3: confirmación
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [sendError, setSendError] = useState("");

  const selectedRoom = ROOMS.find((r) => r.value === habitacion) ?? ROOMS[0];
  const nights = (() => {
    if (!llegada || !salida) return 0;
    const diff = new Date(salida).getTime() - new Date(llegada).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  })();
  const total = nights * selectedRoom.price;

  const canStep2 = habitacion && llegada && salida && nights > 0;
  const canStep3 = canStep2 && nombre && telefono;

  const handleClose = () => {
    setStep(1);
    setDni(""); setNombre(""); setApellidos(""); setTelefono(""); setEmail("");
    setDniFound(null); setDniError(""); setSent(false); setSendError("");
    setLlegada(""); setSalida("");
    onClose();
  };

  // ── Buscar DNI ──────────────────────────────────────────────────────────────
  const handleBuscarDni = async () => {
    if (dni.length !== 8) { setDniError("El DNI debe tener 8 dígitos"); return; }
    setDniLoading(true);
    setDniError("");
    setDniFound(null);
    setNombre(""); setApellidos(""); setTelefono(""); setEmail("");

    // 1. Buscar en BD
    const clienteBD = await buscarClienteEnBD(dni);
    if (clienteBD) {
      setNombre(clienteBD.nombre || "");
      setApellidos(`${clienteBD.apellidoPaterno || ""} ${clienteBD.apellidoMaterno || ""}`.trim());
      setTelefono(clienteBD.telefono || "");
      setEmail(clienteBD.email || "");
      setDniFound("bd");
      setDniLoading(false);
      return;
    }

    // 2. Consultar RENIEC
    const reniec = await buscarEnReniec(dni);
    if (reniec) {
      const nombreCompleto = reniec.nombre || "";
      const ap = reniec.apellidoPaterno || "";
      const am = reniec.apellidoMaterno || "";
      setNombre(nombreCompleto);
      setApellidos(`${ap} ${am}`.trim());
      setDniFound("reniec");
      setDniLoading(false);
      return;
    }

    setDniError("No se encontró información para este DNI. Puedes ingresar los datos manualmente.");
    setDniLoading(false);
  };

  // ── Confirmar reserva (guarda en localStorage como demo / envía al backend) ─
  const handleConfirmar = async () => {
    setSending(true);
    setSendError("");
    try {
      // Guardamos la reserva pendiente en localStorage para notificación al admin
      const reserva = {
        id: Date.now(),
        tipo: "reserva",
        fecha: new Date().toISOString(),
        leido: false,
        habitacion: selectedRoom.label,
        llegada, salida, noches: nights, total,
        nombre: `${nombre} ${apellidos}`.trim(),
        dni, telefono, email, adultos, notas,
      };
      const prev = JSON.parse(localStorage.getItem("dvita_notificaciones") || "[]");
      localStorage.setItem("dvita_notificaciones", JSON.stringify([reserva, ...prev]));

      // Intentar guardar en BD
      try {
        await fetch("/api/reservas-web", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reserva),
        });
      } catch {/* sin backend, no importa */}

      setSent(true);
    } catch {
      setSendError("Ocurrió un error. Por favor intenta de nuevo o llámanos.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.currentTarget === e.target) handleClose(); }}
      style={{ backgroundColor: "rgba(20,8,2,0.75)" }}
    >
      <div className="relative w-full max-w-[560px] bg-white rounded-sm shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-brand-900 border-b border-brand-800 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-1">
              Hospedaje D'Vita
            </p>
            <h2 className="font-display text-[22px] font-bold text-white leading-tight">
              {sent ? "¡Reserva enviada!" : "Hacer una reserva"}
            </h2>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-white hover:bg-brand-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        {!sent && (
          <div className="flex items-center px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex-shrink-0">
            {[
              { n: 1, label: "Habitación y fechas" },
              { n: 2, label: "Tus datos" },
              { n: 3, label: "Confirmación" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step > s.n ? "bg-green-500 text-white" : step === s.n ? "bg-brand-600 text-white" : "bg-neutral-200 text-neutral-400"
                  }`}>
                    {step > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                  </div>
                  <span className={`text-[12px] font-medium hidden sm:block ${step === s.n ? "text-brand-700" : "text-neutral-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="flex-1 mx-3 h-px bg-neutral-200" />}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── ENVIADO ── */}
          {sent && (
            <div className="flex flex-col items-center text-center py-8 gap-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-display text-[22px] font-bold text-neutral-900 mb-2">¡Reserva enviada con éxito!</h3>
                <p className="text-[14px] text-neutral-500 leading-relaxed max-w-sm">
                  Hemos recibido tu solicitud de reserva. Nuestro equipo se pondrá en contacto contigo en menos de 2 horas para confirmarla.
                </p>
              </div>
              <div className="bg-brand-50 border border-brand-100 rounded-sm px-5 py-4 w-full text-left">
                <p className="text-[12px] font-bold text-brand-700 mb-2">Resumen</p>
                <div className="flex flex-col gap-1 text-[13px]">
                  <div className="flex justify-between"><span className="text-neutral-400">Habitación</span><span className="font-medium">{selectedRoom.label}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Llegada</span><span className="font-medium">{llegada}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Salida</span><span className="font-medium">{salida}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Total est.</span><span className="font-display font-bold text-brand-700">S/.{total}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-neutral-400">
                <Phone className="w-3.5 h-3.5" />
                ¿Tienes dudas? Llámanos al <strong className="text-neutral-700">+51 922 626 148</strong>
              </div>
              <button onClick={handleClose} className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.12em] uppercase rounded-sm transition-colors">
                Cerrar
              </button>
            </div>
          )}

          {/* ── STEP 1: Habitación y fechas ── */}
          {!sent && step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-2.5">
                  Tipo de habitación
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROOMS.map((r) => (
                    <button key={r.value} onClick={() => setHabitacion(r.value)}
                      className={`p-3 rounded-sm border text-left transition-colors ${
                        habitacion === r.value
                          ? "border-[#C9A96E] bg-brand-50 shadow-[0_0_0_1px_rgba(201,169,110,0.3)]"
                          : "border-neutral-200 hover:border-brand-200"
                      }`}
                    >
                      <p className="text-[12px] font-bold text-neutral-800 leading-tight mb-1">{r.label}</p>
                      <p className="text-[14px] font-display font-bold text-brand-600">S/.{r.price}</p>
                      <p className="text-[10px] text-neutral-400 font-light">/ noche</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Llegada", val: llegada, set: setLlegada, min: today },
                  { label: "Salida",  val: salida,  set: setSalida,  min: llegada || today },
                ].map(({ label, val, set, min }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">{label}</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input type="date" min={min} value={val} onChange={(e) => set(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {nights > 0 && (
                <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-[13px] text-brand-700">
                    <BedDouble className="w-4 h-4" />
                    <span className="font-medium">{nights} noche{nights > 1 ? "s" : ""} · {selectedRoom.label}</span>
                  </div>
                  <span className="font-display font-bold text-[18px] text-brand-700">S/.{total}</span>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Datos del cliente con búsqueda de DNI ── */}
          {!sent && step === 2 && (
            <div className="flex flex-col gap-4">
              {/* Resumen paso 1 */}
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-sm px-4 py-3">
                <div>
                  <p className="text-[12px] font-bold text-neutral-600">{selectedRoom.label}</p>
                  <p className="text-[11px] text-neutral-400">{llegada} → {salida} ({nights} noche{nights > 1 ? "s" : ""})</p>
                </div>
                <span className="font-display font-bold text-[18px] text-brand-700">S/.{total}</span>
              </div>

              {/* DNI con botón lupa */}
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  DNI <span className="font-normal normal-case text-neutral-400">(busca tus datos automáticamente)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text" maxLength={8} placeholder="12345678"
                      value={dni} onChange={(e) => { setDni(e.target.value.replace(/\D/g, "")); setDniError(""); setDniFound(null); }}
                      onKeyDown={(e) => e.key === "Enter" && handleBuscarDni()}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 font-mono tracking-widest"
                    />
                  </div>
                  <button
                    onClick={handleBuscarDni}
                    disabled={dniLoading || dni.length !== 8}
                    className="w-11 h-[42px] flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white rounded-sm transition-colors disabled:opacity-40 flex-shrink-0"
                    title="Buscar DNI"
                  >
                    {dniLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                {dniError && (
                  <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />{dniError}
                  </p>
                )}
                {dniFound === "bd" && (
                  <p className="text-[11px] text-green-600 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />Cliente encontrado en nuestra base de datos
                  </p>
                )}
                {dniFound === "reniec" && (
                  <p className="text-[11px] text-blue-600 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />Datos obtenidos de RENIEC · Completa teléfono y email
                  </p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Nombre completo *</label>
                <input type="text" placeholder="Tu nombre completo" value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 placeholder:text-neutral-300"
                />
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Apellidos</label>
                <input type="text" placeholder="Apellidos" value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 placeholder:text-neutral-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Teléfono */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">WhatsApp / Teléfono *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input type="tel" placeholder="+51 9xx xxx xxx" value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 placeholder:text-neutral-300"
                    />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input type="email" placeholder="tu@email.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 placeholder:text-neutral-300"
                    />
                  </div>
                </div>
              </div>

              {/* Adultos + Notas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Adultos</label>
                  <select value={adultos} onChange={(e) => setAdultos(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 bg-white appearance-none cursor-pointer"
                  >
                    {["1","2","3","4","5+"].map((n) => <option key={n} value={n}>{n} adulto{n !== "1" ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  Notas <span className="font-normal normal-case text-neutral-400">(opcional)</span>
                </label>
                <textarea rows={2} placeholder="Ej: llegada tarde, necesito cuna, etc." value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 resize-none placeholder:text-neutral-300"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirmación ── */}
          {!sent && step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 border border-green-200 rounded-sm px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-[13px] text-green-700 font-medium">¡Todo listo! Revisa tu reserva antes de confirmar.</p>
              </div>

              <div className="border border-neutral-200 rounded-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                  <p className="text-[12px] font-bold text-neutral-600 uppercase tracking-widest">Resumen de reserva</p>
                </div>
                <div className="p-4 flex flex-col gap-2.5">
                  {[
                    { label: "Habitación", value: selectedRoom.label },
                    { label: "Llegada",    value: llegada },
                    { label: "Salida",     value: salida },
                    { label: "Noches",     value: `${nights} noche${nights > 1 ? "s" : ""}` },
                    { label: "Nombre",     value: `${nombre} ${apellidos}`.trim() },
                    { label: "DNI",        value: dni || "—" },
                    { label: "Teléfono",   value: telefono },
                    { label: "Adultos",    value: `${adultos} adulto${adultos !== "1" ? "s" : ""}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-[13px]">
                      <span className="text-neutral-400 font-medium">{label}</span>
                      <span className="text-neutral-800 font-semibold">{value}</span>
                    </div>
                  ))}
                  {notas && (
                    <div className="flex items-start justify-between text-[13px]">
                      <span className="text-neutral-400 font-medium">Notas</span>
                      <span className="text-neutral-800 text-right max-w-[200px]">{notas}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-neutral-700">Total estimado</span>
                    <span className="font-display font-bold text-[22px] text-brand-700">S/.{total}</span>
                  </div>
                </div>
              </div>

              {sendError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-[12px] text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{sendError}
                </div>
              )}

              <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                Al confirmar, nuestro equipo te contactará en menos de 2 horas para validar disponibilidad.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3 flex-shrink-0">
            {step > 1 ? (
              <button onClick={() => setStep((s) => (s - 1) as Step)}
                className="px-5 py-2.5 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-sm hover:bg-white transition-colors">
                ← Anterior
              </button>
            ) : (
              <button onClick={handleClose}
                className="px-5 py-2.5 border border-neutral-200 text-neutral-500 text-[12px] font-semibold rounded-sm hover:bg-white transition-colors">
                Cancelar
              </button>
            )}

            {step < 3 ? (
              <button onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={step === 1 ? !canStep2 : !canStep3}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Siguiente <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleConfirmar} disabled={sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A96E] hover:bg-[#E8D5A0] text-brand-950 text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors disabled:opacity-50">
                {sending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enviando…</>
                  : <><CheckCircle2 className="w-3.5 h-3.5" />Confirmar reserva</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
