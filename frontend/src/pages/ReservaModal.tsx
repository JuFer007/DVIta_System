import { useState } from "react";
import { X, CalendarDays, User, Phone, BedDouble, ChevronRight, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  initialRoom?: string;
}

const ROOMS = [
  { value: "estandar", label: "Habitación Estándar", price: 60,  features: ["TV Cable", "Baño privado", "WiFi"] },
  { value: "suite",    label: "Suite Deluxe",        price: 120, features: ['TV 50"', "Sala de estar", "Mini bar"] },
  { value: "familiar", label: "Habitación Familiar", price: 180, features: ["3 camas", "Área adicional", "Frigobar"] },
];

type Step = 1 | 2 | 3;

export default function ReservaModal({ open, onClose, onLogin, initialRoom = "estandar" }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    habitacion: initialRoom,
    llegada: "",
    salida: "",
    nombre: "",
    telefono: "",
    adultos: "1",
    notas: "",
  });

  const selectedRoom = ROOMS.find((r) => r.value === form.habitacion) ?? ROOMS[0];

  const nights = (() => {
    if (!form.llegada || !form.salida) return 0;
    const diff = new Date(form.salida).getTime() - new Date(form.llegada).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  })();

  const total = nights * selectedRoom.price;

  const canStep2 = form.habitacion && form.llegada && form.salida && nights > 0;
  const canStep3 = canStep2 && form.nombre && form.telefono;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        backgroundColor: "rgba(20, 8, 2, 0.75)",
      }}
    >
      {/* Modal*/}
      <div
        className="relative w-full max-w-[540px] bg-white rounded-sm shadow-2xl overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-brand-900 border-b border-brand-800">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-1">
              Hospedaje D'Vita
            </p>
            <h2 className="font-display text-[22px] font-bold text-white leading-tight">
              {step === 3 ? "Confirmar reserva" : "Hacer una reserva"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-white hover:bg-brand-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Stepper */}
        <div className="flex items-center px-6 py-4 bg-neutral-50 border-b border-neutral-100">
          {[
            { n: 1, label: "Habitación y fechas" },
            { n: 2, label: "Tus datos"           },
            { n: 3, label: "Confirmación"        },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step > s.n
                      ? "bg-green-500 text-white"
                      : step === s.n
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {step > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                </div>
                <span
                  className={`text-[12px] font-medium hidden sm:block ${
                    step === s.n ? "text-brand-700" : "text-neutral-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 mx-3 h-px bg-neutral-200" />}
            </div>
          ))}
        </div>
        {/* Body */}
        <div className="px-6 py-6">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-2.5">
                  Tipo de habitación
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROOMS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setForm((f) => ({ ...f, habitacion: r.value }))}
                      className={`p-3 rounded-sm border text-left transition-colors ${
                        form.habitacion === r.value
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
                  { label: "Llegada", key: "llegada", min: new Date().toISOString().split("T")[0] },
                  { label: "Salida",  key: "salida",  min: form.llegada || new Date().toISOString().split("T")[0] },
                ].map(({ label, key, min }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                      {label}
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="date"
                        min={min}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors bg-white"
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
          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-sm px-4 py-3">
                <div>
                  <p className="text-[12px] font-bold text-neutral-600">{selectedRoom.label}</p>
                  <p className="text-[11px] text-neutral-400">{form.llegada} → {form.salida} ({nights} noche{nights > 1 ? "s" : ""})</p>
                </div>
                <span className="font-display font-bold text-[18px] text-brand-700">S/.{total}</span>
              </div>
              {[
                { label: "Nombre completo",      key: "nombre",   type: "text", Icon: User,  placeholder: "Tu nombre completo" },
                { label: "WhatsApp / Teléfono",  key: "telefono", type: "tel",  Icon: Phone, placeholder: "+51 9xx xxx xxx" },
              ].map(({ label, key, type, Icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  Número de adultos
                </label>
                <select
                  value={form.adultos}
                  onChange={(e) => setForm((f) => ({ ...f, adultos: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 bg-white appearance-none cursor-pointer"
                >
                  {["1", "2", "3", "4", "5+"].map((n) => (
                    <option key={n} value={n}>{n} adulto{n !== "1" ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  Notas adicionales{" "}
                  <span className="font-normal normal-case text-neutral-400">(opcional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: llegada tarde, necesito cuna, etc."
                  value={form.notas}
                  onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 resize-none transition-colors placeholder:text-neutral-300"
                />
              </div>
            </div>
          )}
          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="bg-green-50 border border-green-200 rounded-sm px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-[13px] text-green-700 font-medium">
                  ¡Todo listo! Revisa tu reserva antes de confirmar.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-sm overflow-hidden">
                <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                  <p className="text-[12px] font-bold text-neutral-600 uppercase tracking-widest">Resumen de reserva</p>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  {[
                    { label: "Habitación", value: selectedRoom.label },
                    { label: "Llegada",    value: form.llegada },
                    { label: "Salida",     value: form.salida },
                    { label: "Noches",     value: `${nights} noche${nights > 1 ? "s" : ""}` },
                    { label: "Nombre",     value: form.nombre },
                    { label: "Teléfono",   value: form.telefono },
                    { label: "Adultos",    value: `${form.adultos} adulto${form.adultos !== "1" ? "s" : ""}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-[13px]">
                      <span className="text-neutral-400 font-medium">{label}</span>
                      <span className="text-neutral-800 font-semibold">{value}</span>
                    </div>
                  ))}
                  {form.notas && (
                    <div className="flex items-start justify-between text-[13px]">
                      <span className="text-neutral-400 font-medium">Notas</span>
                      <span className="text-neutral-800 text-right max-w-[200px]">{form.notas}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-neutral-700">Total estimado</span>
                    <span className="font-display font-bold text-[22px] text-brand-700">S/.{total}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-400 text-center leading-relaxed">
                Al confirmar, nuestro equipo se pondrá en contacto contigo en menos de 2 horas para validar la disponibilidad.
              </p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-sm hover:border-neutral-300 hover:bg-white transition-colors tracking-wide"
            >
              ← Anterior
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="px-5 py-2.5 border border-neutral-200 text-neutral-500 text-[12px] font-semibold rounded-sm hover:border-neutral-300 hover:bg-white transition-colors tracking-wide"
            >
              Cancelar
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 1 ? !canStep2 : !canStep3}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => { handleClose(); onLogin(); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A96E] hover:bg-[#E8D5A0] text-brand-950 text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors"
            >
              Confirmar reserva
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
