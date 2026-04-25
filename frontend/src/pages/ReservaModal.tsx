// src/pages/ReservaModal.tsx
// Solo UI — toda la lógica vive en useReservaModal

import {
  X, CalendarDays, Phone, BedDouble, ChevronRight,
  CheckCircle2, Search, Loader2, Mail, AlertCircle,
  User, CreditCard, Building2,
} from "lucide-react";
import { useReservaModal, ROOMS, type RoomValue } from "../hooks/useReservaModal";

interface Props {
  open: boolean;
  onClose: () => void;
  initialRoom?: string;
}

export default function ReservaModal({ open, onClose, initialRoom = "estandar" }: Props) {
  const h = useReservaModal(initialRoom as RoomValue);

  function handleClose() {
    h.reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.currentTarget === e.target) handleClose(); }}
      style={{ backgroundColor: "rgba(20,8,2,0.75)" }}
    >
      <div
        className="relative w-full max-w-[580px] bg-white rounded-sm shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "92vh" }}
      >
        <ModalHeader sent={h.sent} onClose={handleClose} />

        {!h.sent && <Stepper step={h.step} />}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {h.sent && <StepSuccess h={h} onClose={handleClose} />}
          {!h.sent && h.step === 1 && <Step1 h={h} />}
          {!h.sent && h.step === 2 && <Step2 h={h} />}
          {!h.sent && h.step === 3 && <Step3 h={h} />}
        </div>

        {!h.sent && (
          <ModalFooter
            step={h.step}
            canNext={h.step === 1 ? h.canGoStep2 : h.canGoStep3}
            sending={h.sending}
            onBack={() => h.setStep((s) => (s - 1) as 1 | 2 | 3)}
            onNext={() => h.setStep((s) => (s + 1) as 1 | 2 | 3)}
            onConfirm={h.confirmar}
            onCancel={handleClose}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ModalHeader({ sent, onClose }: { sent: boolean; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 bg-brand-900 border-b border-brand-800 flex-shrink-0">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A96E] mb-1">
          Hospedaje D'Vita
        </p>
        <h2 className="font-display text-[22px] font-bold text-white leading-tight">
          {sent ? "¡Reserva confirmada!" : "Hacer una reserva"}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-white hover:bg-brand-700 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Fechas y tipo" },
    { n: 2, label: "Tus datos" },
    { n: 3, label: "Confirmar" },
  ];
  return (
    <div className="flex items-center px-6 py-4 bg-neutral-50 border-b border-neutral-100 flex-shrink-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                step > s.n  ? "bg-green-500 text-white"
                : step === s.n ? "bg-brand-600 text-white"
                : "bg-neutral-200 text-neutral-400"
              }`}
            >
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
  );
}

function ModalFooter({
  step, canNext, sending,
  onBack, onNext, onConfirm, onCancel,
}: {
  step: number; canNext: boolean; sending: boolean;
  onBack: () => void; onNext: () => void;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3 flex-shrink-0">
      {step > 1 ? (
        <button
          onClick={onBack} disabled={sending}
          className="px-5 py-2.5 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-sm hover:bg-white transition-colors disabled:opacity-50"
        >
          ← Anterior
        </button>
      ) : (
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-neutral-200 text-neutral-500 text-[12px] font-semibold rounded-sm hover:bg-white transition-colors"
        >
          Cancelar
        </button>
      )}

      {step < 3 ? (
        <button
          onClick={onNext} disabled={!canNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          onClick={onConfirm} disabled={sending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A96E] hover:bg-[#E8D5A0] text-brand-950 text-[12px] font-bold tracking-[0.1em] uppercase rounded-sm transition-colors disabled:opacity-50"
        >
          {sending
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Procesando…</>
            : <><CheckCircle2 className="w-3.5 h-3.5" />Confirmar reserva</>
          }
        </button>
      )}
    </div>
  );
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────

function StepSuccess({ h, onClose }: { h: ReturnType<typeof useReservaModal>; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      </div>
      <div>
        <h3 className="font-display text-[22px] font-bold text-neutral-900 mb-2">
          ¡Tu reserva fue registrada!
        </h3>
        <p className="text-[14px] text-neutral-500 leading-relaxed max-w-sm">
          Nuestro equipo revisará tu solicitud y se pondrá en contacto para confirmar los detalles de pago.
        </p>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-sm px-5 py-4 w-full text-left">
        <p className="text-[12px] font-bold text-brand-700 mb-3">Resumen</p>
        <div className="flex flex-col gap-2 text-[13px]">
          {h.result?.idReserva && (
            <SummaryRow label="N° Reserva" value={`#${h.result.idReserva}`} highlight />
          )}
          <SummaryRow label="Habitación" value={h.selectedRoom.label} />
          <SummaryRow label="Llegada"    value={h.llegada} />
          <SummaryRow label="Salida"     value={h.salida} />
          <SummaryRow label="Noches"     value={String(h.nights)} />
          <div className="border-t border-brand-100 pt-2 mt-1 flex items-center justify-between">
            <span className="font-bold text-neutral-700">Total a pagar</span>
            <span className="font-display font-bold text-[18px] text-brand-700">S/.{h.total}</span>
          </div>
        </div>
      </div>

      {h.result?.idPago && (
        <div className="flex items-center gap-2 text-[12px] text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-sm px-4 py-2.5 w-full">
          <CreditCard className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          Pago registrado (pendiente de cobro) · N° {h.result.idPago}
        </div>
      )}

      <div className="flex items-center gap-2 text-[12px] text-neutral-400">
        <Phone className="w-3.5 h-3.5" />
        ¿Dudas? Llámanos al <strong className="text-neutral-700 ml-1">+51 922 626 148</strong>
      </div>

      <button
        onClick={onClose}
        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.12em] uppercase rounded-sm transition-colors"
      >
        Cerrar
      </button>
    </div>
  );
}

// ─── Step 1: Habitación y fechas ──────────────────────────────────────────────

function Step1({ h }: { h: ReturnType<typeof useReservaModal> }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Selector de habitación */}
      <div>
        <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-2.5">
          Tipo de habitación
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {ROOMS.map((r) => (
            <button
              key={r.value}
              onClick={() => h.setHabitacion(r.value)}
              className={`p-3 rounded-sm border text-left transition-colors ${
                h.habitacion === r.value
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

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Fecha de llegada", val: h.llegada, set: h.setLlegada, min: h.today,              max: h.salida || undefined },
          { label: "Fecha de salida",  val: h.salida,  set: h.setSalida,  min: h.llegada || h.today, max: undefined },
        ].map(({ label, val, set, min, max }) => (
          <div key={label}>
            <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
              {label}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="date" min={min} max={max} value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 bg-white"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Resumen precio */}
      {h.nights > 0 && (
        <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-sm px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] text-brand-700">
            <BedDouble className="w-4 h-4" />
            <span className="font-medium">
              {h.nights} noche{h.nights > 1 ? "s" : ""} · {h.selectedRoom.label}
            </span>
          </div>
          <span className="font-display font-bold text-[18px] text-brand-700">S/.{h.total}</span>
        </div>
      )}

      {/* Features */}
      <div className="flex flex-wrap gap-1.5">
        {h.selectedRoom.features.map((f) => (
          <span key={f} className="text-[11px] font-medium bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-sm">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: Datos del cliente ────────────────────────────────────────────────

function Step2({ h }: { h: ReturnType<typeof useReservaModal> }) {
  return (
    <div className="flex flex-col gap-4">

      {/* Mini resumen */}
      <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-sm px-4 py-3">
        <div>
          <p className="text-[12px] font-bold text-neutral-600">{h.selectedRoom.label}</p>
          <p className="text-[11px] text-neutral-400">
            {h.llegada} → {h.salida} ({h.nights} noche{h.nights > 1 ? "s" : ""})
          </p>
        </div>
        <span className="font-display font-bold text-[18px] text-brand-700">S/.{h.total}</span>
      </div>

      {/* Búsqueda de DNI */}
      <div className="border border-neutral-200 rounded-sm overflow-hidden">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <p className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">
            Buscar por DNI
          </p>
        </div>
        <div className="p-4">
          <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
            DNI <span className="text-brand-500">*</span>
            <span className="font-normal normal-case text-neutral-400 ml-1">
              — cargamos tus datos automáticamente
            </span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text" maxLength={8} placeholder="12345678"
                value={h.dni}
                onChange={(e) => {
                  h.setDni(e.target.value.replace(/\D/g, ""));
                  h.resetDni();
                }}
                onKeyDown={(e) => e.key === "Enter" && h.buscarDni()}
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 font-mono tracking-widest"
              />
            </div>
            <button
              onClick={h.buscarDni}
              disabled={h.dniLoading || h.dni.length !== 8}
              className="w-11 h-[42px] flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white rounded-sm transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {h.dniLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Feedback DNI */}
          {h.dniError && (
            <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0" /> {h.dniError}
            </p>
          )}
          {h.dniStatus === "bd" && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-sm">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              Cliente encontrado en nuestra base de datos · Datos cargados automáticamente
            </div>
          )}
          {h.dniStatus === "reniec" && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-sm">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              Datos obtenidos de RENIEC · Completa tu teléfono y email para continuar
            </div>
          )}
          {h.dniStatus === "notfound" && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600 bg-neutral-50 border border-neutral-200 px-3 py-2 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              DNI no encontrado · Ingresa tus datos manualmente y te registraremos
            </div>
          )}
        </div>
      </div>

      {/* Datos personales */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nombre(s)" required>
          <input type="text" placeholder="Ej: María" value={h.nombre}
            onChange={(e) => h.setNombre(e.target.value)}
            className={inputCls} />
        </FormField>
        <FormField label="Apellido Paterno" required>
          <input type="text" placeholder="Ej: López" value={h.apellidoP}
            onChange={(e) => h.setApellidoP(e.target.value)}
            className={inputCls} />
        </FormField>
        <FormField label="Apellido Materno">
          <input type="text" placeholder="Ej: Ríos" value={h.apellidoM}
            onChange={(e) => h.setApellidoM(e.target.value)}
            className={inputCls} />
        </FormField>
        <FormField label="N° de adultos">
          <select value={h.adultos} onChange={(e) => h.setAdultos(e.target.value)}
            className={inputCls + " appearance-none cursor-pointer bg-white"}>
            {["1", "2", "3", "4", "5+"].map((n) => (
              <option key={n} value={n}>{n} adulto{n !== "1" ? "s" : ""}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Teléfono / WhatsApp" required>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input type="tel" placeholder="987654321" value={h.telefono}
              onChange={(e) => h.setTelefono(e.target.value.replace(/\D/g, ""))}
              className={inputCls + " pl-9"} />
          </div>
        </FormField>
        <FormField label="Email" hint="opcional">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input type="email" placeholder="tu@email.com" value={h.email}
              onChange={(e) => h.setEmail(e.target.value)}
              className={inputCls + " pl-9"} />
          </div>
        </FormField>
      </div>

      <FormField label="Notas" hint="opcional">
        <textarea rows={2} placeholder="Ej: llegada tarde, necesito cuna…"
          value={h.notas} onChange={(e) => h.setNotas(e.target.value)}
          className={inputCls + " resize-none"} />
      </FormField>

      {/* Aviso cliente nuevo */}
      {(h.dniStatus === "reniec" || h.dniStatus === "notfound") && h.nombre && h.telefono && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 text-[12px] text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Al confirmar, registraremos tu perfil automáticamente en nuestra base de datos.
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Confirmación ─────────────────────────────────────────────────────

function Step3({ h }: { h: ReturnType<typeof useReservaModal> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-sm px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        <p className="text-[13px] text-green-700 font-medium">
          Revisa los datos antes de confirmar tu reserva.
        </p>
      </div>

      <div className="border border-neutral-200 rounded-sm overflow-hidden">
        <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
          <p className="text-[12px] font-bold text-neutral-600 uppercase tracking-widest">
            Resumen de reserva
          </p>
        </div>
        <div className="p-4 flex flex-col gap-1.5">
          <SummaryRow label="Habitación" value={h.selectedRoom.label} />
          <SummaryRow label="Llegada"    value={h.llegada} />
          <SummaryRow label="Salida"     value={h.salida} />
          <SummaryRow label="Noches"     value={`${h.nights} noche${h.nights > 1 ? "s" : ""}`} />
          <div className="border-t border-neutral-100 pt-3 mt-1">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Cliente</p>
            <SummaryRow label="Nombre"   value={`${h.nombre} ${h.apellidoP} ${h.apellidoM}`.trim()} />
            <SummaryRow label="DNI"      value={h.dni} />
            <SummaryRow label="Teléfono" value={h.telefono} />
            {h.email  && <SummaryRow label="Email"   value={h.email} />}
            {h.notas  && <SummaryRow label="Notas"   value={h.notas} />}
          </div>
          <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
            <span className="text-[14px] font-bold text-neutral-700">Total estimado</span>
            <span className="font-display font-bold text-[22px] text-brand-700">S/.{h.total}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 bg-brand-50 border border-brand-100 rounded-sm px-4 py-3 text-[12px] text-brand-700">
        <CreditCard className="w-4 h-4 flex-shrink-0" />
        El pago se registrará como <strong className="mx-1">PENDIENTE</strong> y se cobrará en recepción al hacer el check-in.
      </div>

      {h.sendError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-3 text-[12px] text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {h.sendError}
        </div>
      )}
    </div>
  );
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 border border-neutral-200 rounded-sm text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 placeholder:text-neutral-300 transition-all";

function FormField({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
        {label}
        {required && <span className="text-brand-500 ml-1">*</span>}
        {hint && <span className="font-normal normal-case text-neutral-400 ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[13px] py-0.5">
      <span className="text-neutral-400 font-medium">{label}</span>
      <span className={`font-semibold text-right max-w-[280px] truncate ${highlight ? "text-brand-700" : "text-neutral-800"}`}>
        {value}
      </span>
    </div>
  );
}
