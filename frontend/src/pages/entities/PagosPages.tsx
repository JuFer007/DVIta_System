import { useState } from "react";
import { CreditCard, FileText, Receipt, Pencil, CheckCircle, DollarSign, X } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { pagosService, reservasService, downloadPdf, BASE_URL } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

const mapReserva = (r: any) => ({
  id: r.idReserva,
  clienteId: r.cliente?.idCliente || "",
  habitacionId: r.habitacion?.idHabitacion || "",
  empleadoId: r.empleado?.idEmpleado || "",
  cliente: `${r.cliente?.nombre || ""} ${r.cliente?.apellidoPaterno || ""}`.trim() || "—",
  habitacion: String(r.habitacion?.numeroHabitacion || "—"),
  ingreso: r.fechaIngreso, salida: r.fechaSalida, estado: r.estadoReserva, _raw: r,
});

const mapPago = (p: any) => ({
  id: p.idPago,
  reservaId: p.reserva?.idReserva || "",
  reserva: `#${p.reserva?.idReserva || "?"} – ${p.reserva?.cliente?.nombre || "—"}`,
  monto: Number(p.monto),
  montoFmt: `S/.${Number(p.monto).toFixed(2)}`,
  fecha: p.fechaPago,
  metodo: p.metodoPago,
  estado: p.estado || "PENDIENTE",
  _raw: p,
});

const DEMO_P: any[] = [{ id: 1, reservaId: 1, reserva: "#1 – María López", monto: 240, montoFmt: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE", estado: "COMPLETADO", _raw: {} }];
const DEMO_R: any[] = [{ id: 1, cliente: "María López", habitacion: "101", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA", _raw: {} }];

export default function PagosPage() {
  const crud         = useCrud(pagosService,    mapPago,    DEMO_P);
  const reservasCrud = useCrud(reservasService, mapReserva, DEMO_R);
  const m = useModalState();
  const toast = useToast();

  const [cobrarRow, setCobrarRow] = useState<any | null>(null);
  const [cobrarMetodo, setCobrarMetodo] = useState("EFECTIVO");

  const today = new Date().toISOString().split("T")[0];

  const metodoOptions = [
    { value: "EFECTIVO",        label: "Efectivo" },
    { value: "TARJETA_CREDITO", label: "Tarjeta de Crédito" },
    { value: "TARJETA_DEBITO",  label: "Tarjeta de Débito" },
    { value: "TRANSFERENCIA",   label: "Transferencia" },
    { value: "YAPE",            label: "Yape" },
    { value: "PLIN",            label: "Plin" },
  ];

  const fields: ModalField[] = [
    {
      key: "idReserva", label: "Reserva", required: true, type: "select",
      options: reservasCrud.data.map((r) => ({ value: r.id, label: `#${r.id} — ${r.cliente?.toUpperCase()} (Hab. ${r.habitacion})` })),
      hint: "Selecciona la reserva a la que pertenece el pago", cols: 2,
    },
    { key: "monto",     label: "Monto (S/.)",    required: true, type: "number", placeholder: "240.00", min: 0.01, hint: "Debe ser mayor a 0" },
    { key: "fechaPago", label: "Fecha de Pago",  required: true, type: "date",   max: today, hint: "No puede ser una fecha futura" },
    {
      key: "metodoPago", label: "Método de Pago", required: true, type: "select",
      hint: "Efectivo, Tarjeta, Yape, Plin, etc.",
      options: metodoOptions,
      cols: 2,
    },
  ];

  const getFormData = (row: any) =>
    row ? { idReserva: row.reservaId, monto: row.monto, fechaPago: row.fecha, metodoPago: row.metodo } : { fechaPago: today };

  const handleConfirmarCobro = async () => {
    if (!cobrarRow) return;
    const ok = await pagosService.completar(cobrarRow.id, { metodoPago: cobrarMetodo });
    if (ok) {
      crud.refetch();
      toast.showToast("success", "Pago completado", `#${cobrarRow.id} — ${cobrarMetodo}`);
      setCobrarRow(null);
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al completar", crud.saveError);
    }
  };

  const handleSave = async (form: any) => {
    if (!form.idReserva) {
      toast.showToast("fail", "Validación", "Debes seleccionar una reserva");
      return;
    }
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) {
      toast.showToast("fail", "Validación", "El monto debe ser mayor a 0");
      return;
    }
    if (!form.fechaPago) {
      toast.showToast("fail", "Validación", "La fecha de pago es obligatoria");
      return;
    }
    if (!form.metodoPago) {
      toast.showToast("fail", "Validación", "Selecciona un método de pago");
      return;
    }
    const payload = { reserva: { idReserva: Number(form.idReserva) }, monto, fechaPago: form.fechaPago, metodoPago: form.metodoPago };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) {
      toast.showToast("success", m.editing ? "Pago actualizado" : "Pago registrado", `S/.${monto.toFixed(2)} — ${form.metodoPago}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  const sortedData = [...crud.data].sort((a, b) => {
    const order: Record<string, number> = { PENDIENTE: 0, COMPLETADO: 1, CANCELADO: 2 };
    return (order[a.estado] ?? 99) - (order[b.estado] ?? 99);
  });

  return (
    <>
      <DataTable
        title="Pagos" data={sortedData} loading={crud.loading} error={crud.error}
        columns={[
          { key: "reserva",  label: "Reserva", render: (v: string) => v?.toUpperCase() || "—" },
          { key: "montoFmt", label: "Monto" },
          { key: "fecha",    label: "Fecha" },
          { key: "metodo",   label: "Método" },
          {
            key: "estado", label: "Estado", sortable: false,
            render: (_: any, row: any) => (
              row.estado === "COMPLETADO"
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-green-700 bg-green-100 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Completado</span>
                : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-100 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pendiente</span>
            ),
          },
          {
            key: "_acciones", label: "Acciones", sortable: false,
            render: (_: any, row: any) => (
              <div className="flex items-center gap-2">
                {row.estado === "PENDIENTE" && (
                  <>
                    <button
                      onClick={() => { m.openEdit(row); }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      onClick={() => { setCobrarRow(row); setCobrarMetodo("EFECTIVO"); }}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <DollarSign className="w-3 h-3" /> Cobrar
                    </button>
                  </>
                )}
                {row.estado === "COMPLETADO" && (
                  <button
                    onClick={() => downloadPdf(`${BASE_URL}/pagos/${row.id}/ticket`)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
                  >
                    <Receipt className="w-3 h-3" /> Ticket
                  </button>
                )}
              </div>
            ),
          },
        ]}
        onNew={m.openNew}
        headerExtra={
          <button onClick={() => downloadPdf(`${BASE_URL}/pagos/pdf/reporte`, "reporte-pagos.pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF General
          </button>
        }
      />
      <EntityModal
        open={m.modalOpen} title="Pago" icon={<CreditCard className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />

      {cobrarRow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-800">Completar Pago</p>
                   <p className="text-[12px] text-gray-400">#{cobrarRow.id} — {cobrarRow.reserva?.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setCobrarRow(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="mb-5">
              <p className="text-[13px] font-semibold text-gray-700 mb-2">Monto: <span className="text-brand-700">{cobrarRow.montoFmt}</span></p>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Método de Pago</label>
              <select
                value={cobrarMetodo}
                onChange={(e) => setCobrarMetodo(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                {metodoOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setCobrarRow(null)} className="px-4 py-2 text-[12px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmarCobro} className="px-4 py-2 text-[12px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
