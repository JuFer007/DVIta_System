import { useState, useEffect } from "react";
import { CalendarCheck, Search, Loader2, User, CheckCircle2, AlertCircle, X, ChevronDown, Save, LogIn, LogOut, XCircle, FileText } from "lucide-react";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";
import { useCrud } from "../../hooks/useCrud";
import { reservasService, clientesService, habitacionesService, tiposService, reniecService, downloadPdf } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";
import { useConfirm } from "../../hooks/useConfirm";
import { useAuth } from "../../context/AuthContext";

const mapCliente    = (c: any) => ({ id: c.idCliente, nombre: c.nombre, apellidoP: c.apellidoPaterno, dni: c.dni, telefono: c.telefono, email: c.email, _raw: c });
const mapHabitacion = (h: any) => ({
  id: h.idHabitacion, numero: String(h.numeroHabitacion),
  tipo: h.tipoHabitacion?.descripcion || "—", estado: h.estado,
  precio: Number(h.precio), _raw: h,
});
const mapTipo = (t: any) => ({ id: t.idTipoHabitacion, descripcion: t.descripcion, precio: t.precio, _raw: t });
const mapReserva = (r: any) => ({
  id: r.idReserva,
  clienteId:    r.cliente?.idCliente    || "",
  habitacionId: r.habitacion?.idHabitacion || "",
  empleadoId:   r.empleado?.idEmpleado  || "",
  cliente:    `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
  habitacion: String(r.habitacion?.numeroHabitacion || "—"),
  empleado:   `${r.empleado?.nombre || ""} ${r.empleado?.apellidoP || ""}`.trim() || "—",
  fechaReserva: r.fechaReserva,
  ingreso:  r.fechaIngreso,
  salida:   r.fechaSalida,
  estado:   r.estadoReserva,
  _raw: r,
});

const DEMO_R: any[] = [{ id: 1, clienteId: 1, habitacionId: 1, empleadoId: 1, cliente: "María López", habitacion: "101", empleado: "Pedro Huamán", fechaReserva: "2025-07-01", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA", _raw: {} }];
const DEMO_T: any[] = [{ id: 1, descripcion: "Estándar", precio: 60, _raw: {} }];

type DniStatus = "idle" | "loading" | "found-bd" | "found-reniec" | "notfound" | "manual";

export default function ReservasPage() {
  const { user } = useAuth();
  const toast  = useToast();
  const confirmDel = useConfirm();
  const crud     = useCrud(reservasService,    mapReserva,    DEMO_R);
  const tiposCrud = useCrud(tiposService,      mapTipo,       DEMO_T);
  const m = useModalState();

  const today = new Date().toISOString().split("T")[0];

  const [dni, setDni] = useState("");
  const [dniStatus, setDniStatus] = useState<DniStatus>("idle");
  const [dniError, setDniError] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null);
  const [useSelectCliente, setUseSelectCliente] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState("");

  const [selectedTipoId, setSelectedTipoId] = useState("");
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<any[]>([]);
  const [verificando, setVerificando] = useState(false);
  const [verificado, setVerificado] = useState(false);

  const [form, setForm] = useState<Record<string, string>>({
    idHabitacion: "", idEmpleado: "", fechaReserva: today,
    fechaIngreso: "", fechaSalida: "", estadoReserva: "PENDIENTE",
  });

  const resetDniState = () => {
    setDni(""); setDniStatus("idle"); setDniError(""); setClienteEncontrado(null);
    setUseSelectCliente(false); setSelectedClienteId("");
  };

  const resetHabitacionState = () => {
    setSelectedTipoId(""); setHabitacionesDisponibles([]); setVerificando(false); setVerificado(false);
    set("idHabitacion", "");
  };

  const handleOpenNew = () => {
    resetDniState();
    resetHabitacionState();
    setForm({ idHabitacion: "", idEmpleado: String(user?.idEmpleado ?? ""), fechaReserva: today, fechaIngreso: "", fechaSalida: "", estadoReserva: "PENDIENTE" });
    m.openNew();
  };

  const handleOpenEdit = (row: any) => {
    resetDniState();
    setDni(row._raw?.cliente?.dni || "");
    setClienteEncontrado({ id: row.clienteId, nombre: row._raw?.cliente?.nombre || "", apellidoP: row._raw?.cliente?.apellidoPaterno || "", dni: row._raw?.cliente?.dni || "" });
    setDniStatus("found-bd");
    setForm({
      idHabitacion: row.habitacionId, idEmpleado: String(user?.idEmpleado ?? row.empleadoId ?? ""),
      fechaReserva: row.fechaReserva, fechaIngreso: row.ingreso,
      fechaSalida: row.salida, estadoReserva: row.estado,
    });
    setSelectedClienteId(row.clienteId);
    const habRaw = row._raw?.habitacion;
    const tipo = habRaw?.tipoHabitacion;
    if (tipo) setSelectedTipoId(String(tipo.idTipoHabitacion));
    if (habRaw) {
      setHabitacionesDisponibles([mapHabitacion(habRaw)]);
    }
    m.openEdit(row);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchDisponibles = async () => {
      if (!selectedTipoId || !form.fechaIngreso || !form.fechaSalida || form.fechaSalida <= form.fechaIngreso) {
        if (!cancelled) { setHabitacionesDisponibles([]); setVerificado(false); }
        return;
      }
      if (!cancelled) setVerificando(true);
      if (!cancelled) setVerificado(false);
      try {
        const disponibles = await habitacionesService.getDisponibles(form.fechaIngreso, form.fechaSalida, Number(selectedTipoId));
        if (!cancelled) { setHabitacionesDisponibles(disponibles.map(mapHabitacion)); setVerificado(true); }
      } catch {
        if (!cancelled) setVerificado(true);
      } finally {
        if (!cancelled) setVerificando(false);
      }
    };
    fetchDisponibles();
    return () => { cancelled = true; };
  }, [selectedTipoId, form.fechaIngreso, form.fechaSalida]);

  const handleDniSearch = async () => {
    if (dni.length !== 8) { setDniError("El DNI debe tener 8 dígitos"); return; }
    setDniStatus("loading"); setDniError(""); setClienteEncontrado(null);

    try {
      const cliente = await clientesService.getByDni(dni);
      setClienteEncontrado({ id: cliente.idCliente, nombre: cliente.nombre, apellidoP: cliente.apellidoPaterno, apellidoM: cliente.apellidoMaterno, dni: cliente.dni, telefono: cliente.telefono, email: cliente.email });
      setSelectedClienteId(String(cliente.idCliente));
      setDniStatus("found-bd");
      return;
    } catch {
    }

    try {
      const reniec = await reniecService.consultar(dni);
      const nombre = reniec?.nombres || reniec?.first_name || "";
      const apellidoP = reniec?.apellidoPaterno || reniec?.first_last_name || "";
      const apellidoM = reniec?.apellidoMaterno || reniec?.second_last_name || "";

      if (nombre || apellidoP) {
        setClienteEncontrado({ id: null, nombre, apellidoP, apellidoM, dni, telefono: "", email: "", desdeReniec: true });
        setDniStatus("found-reniec");
        return;
      }
    } catch {
    }

    setClienteEncontrado({ id: null, nombre: "", apellidoP: "", apellidoM: "", dni, telefono: "", email: "" });
    setDniStatus("notfound");
    setDniError("No se encontró el DNI. Ingresa los datos manualmente.");
  };

  const validaFechas = (): string | null => {
    if (!form.fechaIngreso || !form.fechaSalida) return "Completa las fechas de ingreso y salida";
    if (form.fechaSalida <= form.fechaIngreso) return "La fecha de salida debe ser posterior a la de ingreso";
    return null;
  };

  const handleSave = async () => {
    if (!form.idHabitacion) {
      toast.showToast("fail", "Habitación requerida", "Selecciona una habitación disponible");
      return;
    }
    const errFechas = validaFechas();
    if (errFechas) { toast.showToast("fail", "Fechas inválidas", errFechas); return; }
    if (!form.idEmpleado) {
      toast.showToast("fail", "Sin sesión", "No se pudo identificar al empleado. Vuelve a iniciar sesión.");
      return;
    }
    if (useSelectCliente && !selectedClienteId) {
      toast.showToast("fail", "Cliente requerido", "Selecciona un cliente de la lista");
      return;
    }
    if (!useSelectCliente && dniStatus === "idle") {
      toast.showToast("fail", "Cliente requerido", "Ingresa un DNI o selecciona un cliente");
      return;
    }

    const crearToast = (ok: boolean, accion: string) => {
      if (ok) toast.showToast("success", `Reserva ${accion}`, "La operación se completó correctamente");
      else toast.showToast("fail", "Error", `No se pudo ${accion} la reserva`);
      return ok;
    };

    const basePayload = {
      idHabitacion: Number(form.idHabitacion),
      idEmpleado: Number(form.idEmpleado),
      fechaReserva: form.fechaReserva,
      fechaIngreso: form.fechaIngreso,
      fechaSalida: form.fechaSalida,
      estadoReserva: form.estadoReserva,
    };

    if (dniStatus === "found-bd" || (useSelectCliente && selectedClienteId)) {
      const clienteId = useSelectCliente ? Number(selectedClienteId) : Number(clienteEncontrado?.id);
      const payload = { ...basePayload, idCliente: clienteId };
      const ok = m.editing
        ? await crud.update(m.editing.id, { cliente: { idCliente: clienteId }, habitacion: { idHabitacion: Number(form.idHabitacion) }, empleado: { idEmpleado: Number(form.idEmpleado) }, fechaReserva: form.fechaReserva, fechaIngreso: form.fechaIngreso, fechaSalida: form.fechaSalida, estadoReserva: form.estadoReserva })
        : await reservasService.createWithDni(payload).then(() => { crud.refetch(); return true; }).catch(() => false);
      if (crearToast(ok, m.editing ? "actualizada" : "creada")) { resetDniState(); m.closeModal(); }
      return;
    }

    if (dniStatus === "found-reniec" || dniStatus === "notfound" || dniStatus === "manual") {
      const c = clienteEncontrado;
      if (!c?.nombre?.trim() || !c?.apellidoP?.trim()) {
        toast.showToast("fail", "Datos incompletos", "Completa nombre y apellido del cliente");
        return;
      }
      if (!c?.telefono?.trim() || !/^\d{9}$/.test(c.telefono)) {
        toast.showToast("fail", "Teléfono requerido", "El teléfono debe tener exactamente 9 dígitos numéricos");
        return;
      }
      const payload = {
        ...basePayload,
        dniCliente: dni,
        nombreCliente: c.nombre,
        apellidoPaterno: c.apellidoP,
        apellidoMaterno: c.apellidoM || "",
        telefonoCliente: c.telefono,
        emailCliente: c.email || "",
      };
      const ok = m.editing
        ? await crud.update(m.editing.id, { cliente: { idCliente: m.editing.clienteId }, habitacion: { idHabitacion: Number(form.idHabitacion) }, empleado: { idEmpleado: Number(form.idEmpleado) }, fechaReserva: form.fechaReserva, fechaIngreso: form.fechaIngreso, fechaSalida: form.fechaSalida, estadoReserva: form.estadoReserva })
        : await reservasService.createWithDni(payload).then(() => { crud.refetch(); return true; }).catch(() => false);
      if (crearToast(ok, m.editing ? "actualizada" : "creada")) { resetDniState(); m.closeModal(); }
      return;
    }
  };

  const handleCheckIn = async (row: any) => {
    try {
      await reservasService.checkIn(row.id);
      toast.showToast("success", "Check-in realizado", `Reserva #${row.id} — ${row.cliente}`);
      crud.refetch();
    } catch { toast.showToast("fail", "Error", "No se pudo realizar el check-in"); }
  };

  const handleCheckOut = async (row: any) => {
    try {
      await reservasService.checkOut(row.id);
      toast.showToast("success", "Check-out realizado", `Reserva #${row.id} — ${row.cliente}`);
      crud.refetch();
    } catch { toast.showToast("fail", "Error", "No se pudo realizar el check-out"); }
  };

  const handleCancel = async (row: any) => {
    const ok = await confirmDel.confirm({
      title: "Cancelar reserva",
      description: `¿Cancelar la reserva #${row.id} de ${row.cliente}?`,
    });
    if (!ok) return;
    try {
      await reservasService.cancelar(row.id);
      toast.showToast("success", "Reserva cancelada", `Reserva #${row.id} cancelada correctamente`);
      crud.refetch();
    } catch { toast.showToast("fail", "Error", "No se pudo cancelar la reserva"); }
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <>
      <DataTable
        title="Reservas"
        data={[...crud.data].sort((a, b) => {
          const hoy = new Date().toISOString().split("T")[0];
          const aFuturo = a.ingreso >= hoy;
          const bFuturo = b.ingreso >= hoy;
          if (aFuturo && !bFuturo) return -1;
          if (!aFuturo && bFuturo) return 1;
          return aFuturo
            ? a.ingreso.localeCompare(b.ingreso)
            : b.ingreso.localeCompare(a.ingreso);
        })}
        headerExtra={
          <button onClick={() => downloadPdf("/api/reservas/pdf/reporte?desde=2020-01-01&hasta=" + new Date().toISOString().split("T")[0], "reporte-reservas.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        }
        columns={[
          { key: "cliente", label: "Cliente" },
          { key: "habitacion", label: "Hab." },
          { key: "empleado", label: "Empleado" },
          { key: "ingreso", label: "Ingreso" },
          { key: "salida", label: "Salida" },
          { key: "estado", label: "Estado", render: (v) => <StatusBadge status={v} /> },
          {
            key: "_actions", label: "",
            render: (_: any, row: any) => {
              const hoy = new Date().toISOString().split("T")[0];
              const diaDespuesIngreso = new Date(new Date(row.ingreso).getTime() + 86400000).toISOString().split("T")[0];
              const puedeCheckIn  = row.estado === "PENDIENTE" && hoy >= row.ingreso;
              const puedeCheckOut = row.estado === "CONFIRMADA" && hoy >= diaDespuesIngreso;
              const puedeCancelar = row.estado === "PENDIENTE" || row.estado === "CONFIRMADA";
              const puedeEditar   = row.estado !== "CANCELADA" && row.estado !== "COMPLETADA";
              const btnCls = (cond: boolean, active: string, inactive: string) =>
                `flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${cond ? active : inactive}`;
              return (
                <div className="flex items-center gap-1">
                  <button onClick={() => puedeCheckIn && handleCheckIn(row)}
                    disabled={!puedeCheckIn}
                    className={btnCls(puedeCheckIn, "text-green-700 bg-green-100 hover:bg-green-200", "text-neutral-300 bg-neutral-100 cursor-not-allowed")}>
                    <LogIn className="w-3.5 h-3.5" /> CHECK-IN
                  </button>
                  <button onClick={() => puedeCheckOut && handleCheckOut(row)}
                    disabled={!puedeCheckOut}
                    className={btnCls(puedeCheckOut, "text-blue-700 bg-blue-100 hover:bg-blue-200", "text-neutral-300 bg-neutral-100 cursor-not-allowed")}>
                    <LogOut className="w-3.5 h-3.5" /> CHECK-OUT
                  </button>
                  <button onClick={() => puedeCancelar && handleCancel(row)}
                    disabled={!puedeCancelar}
                    className={btnCls(puedeCancelar, "text-red-700 bg-red-100 hover:bg-red-200", "text-neutral-300 bg-neutral-100 cursor-not-allowed")}>
                    <XCircle className="w-3.5 h-3.5" /> CANCELAR
                  </button>
                  <button onClick={() => puedeEditar && handleOpenEdit(row)}
                    disabled={!puedeEditar}
                    className={btnCls(puedeEditar, "text-brand-700 bg-brand-100 hover:bg-brand-200", "text-neutral-300 bg-neutral-100 cursor-not-allowed")}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg> EDITAR
                  </button>
                </div>
              );
            },
          },
        ]}
        onNew={handleOpenNew}
      />

      <ReservaFormModal
        open={m.modalOpen}
        isEdit={!!m.editing}
        saving={crud.saving}
        onClose={() => { resetDniState(); m.closeModal(); }}
        onSave={handleSave}
        dni={dni} setDni={setDni}
        dniStatus={dniStatus} setDniStatus={setDniStatus}
        dniError={dniError} setDniError={setDniError}
        clienteEncontrado={clienteEncontrado} setClienteEncontrado={setClienteEncontrado}
        onDniSearch={handleDniSearch}
        useSelectCliente={useSelectCliente} setUseSelectCliente={setUseSelectCliente}
        selectedClienteId={selectedClienteId} setSelectedClienteId={setSelectedClienteId}
        form={form} set={set}
        today={today}
        tipos={tiposCrud.data}
        selectedTipoId={selectedTipoId} setSelectedTipoId={setSelectedTipoId}
        habitacionesDisponibles={habitacionesDisponibles}
        verificando={verificando}
        verificado={verificado}
        onClearHabitaciones={() => set("idHabitacion", "")}
        editingRow={m.editing}
      />
    </>
  );
}

function ReservaFormModal({
  open, isEdit, saving, onClose, onSave,
  dni, setDni, dniStatus, setDniStatus, dniError, setDniError,
  clienteEncontrado, setClienteEncontrado, onDniSearch,
  useSelectCliente, setUseSelectCliente,
  selectedClienteId, setSelectedClienteId,
  form, set, today,
  tipos, selectedTipoId, setSelectedTipoId,
  habitacionesDisponibles, verificando, verificado, onClearHabitaciones,
  editingRow,
}: {
  open: boolean; isEdit: boolean; saving: boolean;
  onClose: () => void; onSave: () => void;
  dni: string; setDni: (v: string) => void;
  dniStatus: DniStatus; setDniStatus: (v: DniStatus) => void;
  dniError: string; setDniError: (v: string) => void;
  clienteEncontrado: any; setClienteEncontrado: (v: any) => void;
  onDniSearch: () => void;
  useSelectCliente: boolean; setUseSelectCliente: (v: boolean) => void;
  selectedClienteId: string; setSelectedClienteId: (v: string) => void;
  form: Record<string, string>; set: (k: string, v: string) => void;
  today: string;
  tipos: any[]; selectedTipoId: string; setSelectedTipoId: (v: string) => void;
  habitacionesDisponibles: any[]; verificando: boolean; verificado: boolean; onClearHabitaciones: () => void;
  editingRow: any;
}) {
  const [manualTelefono, setManualTelefono] = useState("");
  const [manualEmail, setManualEmail] = useState("");

  useEffect(() => {
    if (open) { setManualTelefono(""); setManualEmail(""); }
  }, [open]);

  if (!open) return null;

  const showDniSection = !useSelectCliente;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: "640px", maxHeight: "90vh" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 bg-brand-900 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-700/50 flex items-center justify-center text-brand-200 flex-shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-brand-300 mb-0.5">
              {isEdit ? "Editar" : "Nueva"}
            </p>
            <h2 className="font-display text-[20px] font-bold text-white leading-tight truncate">
              Reserva
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-400 hover:text-white hover:bg-brand-700 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500">
                  Cliente <span className="text-brand-500">*</span>
                </label>
                {showDniSection && (
                  <button
                    type="button"
                    onClick={() => { setUseSelectCliente(true); setDniStatus("idle"); }}
                    className="text-[11px] text-brand-600 hover:text-brand-500 font-semibold underline underline-offset-2"
                  >
                    ó seleccionar de lista →
                  </button>
                )}
                {useSelectCliente && (
                  <button
                    type="button"
                    onClick={() => { setUseSelectCliente(false); setSelectedClienteId(""); }}
                    className="text-[11px] text-brand-600 hover:text-brand-500 font-semibold underline underline-offset-2"
                  >
                    ← Buscar por DNI
                  </button>
                )}
              </div>

              {showDniSection ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="text" maxLength={8} placeholder="12345678"
                        value={dni}
                        onChange={(e) => { setDni(e.target.value.replace(/\D/g, "")); setDniStatus("idle"); setDniError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && dni.length === 8 && onDniSearch()}
                        disabled={dniStatus === "loading" || dniStatus === "found-bd"}
                        className="w-full pl-9 pr-3 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 font-mono tracking-widest disabled:bg-neutral-50 disabled:text-neutral-400"
                      />
                    </div>
                    {(dniStatus === "idle" || dniStatus === "notfound" || dniStatus === "manual") && (
                      <button
                        onClick={onDniSearch}
                        disabled={dni.length !== 8}
                        className="w-11 h-[42px] flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                    {dniStatus === "loading" && (
                      <div className="w-11 h-[42px] flex items-center justify-center bg-neutral-100 rounded-lg flex-shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                      </div>
                    )}
                  </div>

                  {dniStatus === "loading" && (
                    <p className="text-[12px] text-neutral-500 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Buscando cliente…
                    </p>
                  )}

                  {dniStatus === "found-bd" && clienteEncontrado && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-[13px] text-green-800 font-medium">
                        {clienteEncontrado.nombre} {clienteEncontrado.apellidoP} — DNI: {clienteEncontrado.dni}
                      </span>
                    </div>
                  )}

                  {dniStatus === "found-reniec" && clienteEncontrado && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-[13px] text-amber-800 font-medium">
                          {clienteEncontrado.nombre} {clienteEncontrado.apellidoP} (RENIEC)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Teléfono *</label>
                          <input type="tel" placeholder="999888777" value={clienteEncontrado.telefono || manualTelefono}
                            onChange={(e) => { setClienteEncontrado({ ...clienteEncontrado, telefono: e.target.value }); setManualTelefono(e.target.value); }}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Email</label>
                          <input type="email" placeholder="opcional@mail.com" value={clienteEncontrado.email || manualEmail}
                            onChange={(e) => { setClienteEncontrado({ ...clienteEncontrado, email: e.target.value }); setManualEmail(e.target.value); }}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        El cliente será registrado automáticamente al guardar
                      </p>
                    </div>
                  )}

                  {(dniStatus === "notfound" || dniStatus === "manual") && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Nombres *</label>
                        <input type="text" placeholder="Juan" value={clienteEncontrado?.nombre || ""}
                          onChange={(e) => setClienteEncontrado({ ...clienteEncontrado, nombre: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Apellido Paterno *</label>
                        <input type="text" placeholder="Pérez" value={clienteEncontrado?.apellidoP || ""}
                          onChange={(e) => setClienteEncontrado({ ...clienteEncontrado, apellidoP: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Apellido Materno</label>
                        <input type="text" placeholder="López" value={clienteEncontrado?.apellidoM || ""}
                          onChange={(e) => setClienteEncontrado({ ...clienteEncontrado, apellidoM: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Teléfono *</label>
                        <input type="tel" placeholder="999888777" value={clienteEncontrado?.telefono || ""}
                          onChange={(e) => setClienteEncontrado({ ...clienteEncontrado, telefono: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-500 mb-1">Email</label>
                        <input type="email" placeholder="opcional@mail.com" value={clienteEncontrado?.email || ""}
                          onChange={(e) => setClienteEncontrado({ ...clienteEncontrado, email: e.target.value })}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:border-brand-400" />
                      </div>
                    </div>
                  )}

                  {dniError && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {dniError}
                    </p>
                  )}
                </div>
              ) : (
                <ClienteSelect
                  selectedClienteId={selectedClienteId}
                  setSelectedClienteId={setSelectedClienteId}
                />
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                Tipo de Habitación <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <select value={selectedTipoId}
                  onChange={(e) => { setSelectedTipoId(e.target.value); onClearHabitaciones(); }}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 appearance-none cursor-pointer pr-9 bg-white"
                >
                  <option value="">— Selecciona —</option>
                  {tipos.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.descripcion} (S/.{t.precio}/noche)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Fecha de Ingreso *</label>
              <input type="date" value={form.fechaIngreso} min={today}
                onChange={(e) => { set("fechaIngreso", e.target.value); onClearHabitaciones(); }}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">Fecha de Salida *</label>
              <input type="date" value={form.fechaSalida} min={form.fechaIngreso || today}
                onChange={(e) => { set("fechaSalida", e.target.value); onClearHabitaciones(); }}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50" />
            </div>

            {(habitacionesDisponibles.length > 0 || editingRow) && (
              <div className="col-span-2">
                <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-neutral-500 mb-1.5">
                  Habitación <span className="text-brand-500">*</span>
                </label>
                <div className="relative">
                  <select value={form.idHabitacion}
                    onChange={(e) => set("idHabitacion", e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 appearance-none cursor-pointer pr-9 bg-white"
                  >
                    <option value="">— Selecciona —</option>
                    {habitacionesDisponibles.map((h) => (
                      <option key={h.id} value={h.id}>
                        N° {h.numero}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
                {habitacionesDisponibles.length > 0 && (
                  <p className="mt-1.5 text-[11px] text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {habitacionesDisponibles.length} habitación(es) disponible(s) para este tipo y fechas
                  </p>
                )}
              </div>
            )}

            {verificando && (
              <p className="col-span-2 text-[12px] text-neutral-500 flex items-center gap-1.5 justify-center -mt-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Verificando disponibilidad…
              </p>
            )}

            {!verificando && verificado && habitacionesDisponibles.length === 0 && (
              <div className="col-span-2 flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg -mt-1">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-[13px] text-amber-800 font-medium">
                  No hay habitaciones disponibles para este tipo y fechas seleccionadas
                </span>
              </div>
            )}

          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:border-neutral-300 hover:bg-white transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-bold tracking-[0.08em] uppercase rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
            ) : (
              <><Save className="w-3.5 h-3.5" /> {isEdit ? "Actualizar" : "Crear"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClienteSelect({ selectedClienteId, setSelectedClienteId }: { selectedClienteId: string; setSelectedClienteId: (v: string) => void }) {
  const clientesCrud = useCrud(clientesService, mapCliente, [{ id: 1, nombre: "María López", apellidoP: "López", dni: "12345678", telefono: "", email: "", _raw: {} }]);

  return (
    <div className="relative">
      <select value={selectedClienteId}
        onChange={(e) => setSelectedClienteId(e.target.value)}
        className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-[13px] text-neutral-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 appearance-none cursor-pointer pr-9 bg-white"
      >
        <option value="">— Selecciona —</option>
        {clientesCrud.data.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.nombre} {c.apellidoP} — DNI: {c.dni}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  );
}
