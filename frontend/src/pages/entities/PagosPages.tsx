import { CreditCard, FileText, Receipt, Pencil } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { pagosService, reservasService, downloadPdf } from "../../services/api";
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
  _raw: p,
});

const DEMO_P: any[] = [{ id: 1, reservaId: 1, reserva: "#1 – María López", monto: 240, montoFmt: "S/.240.00", fecha: "2025-07-13", metodo: "YAPE", _raw: {} }];
const DEMO_R: any[] = [{ id: 1, cliente: "María López", habitacion: "101", ingreso: "2025-07-10", salida: "2025-07-13", estado: "CONFIRMADA", _raw: {} }];

export default function PagosPage() {
  const crud         = useCrud(pagosService,    mapPago,    DEMO_P);
  const reservasCrud = useCrud(reservasService, mapReserva, DEMO_R);
  const m = useModalState();
  const toast = useToast();

  const today = new Date().toISOString().split("T")[0];

  const fields: ModalField[] = [
    {
      key: "idReserva", label: "Reserva", required: true, type: "select",
      options: reservasCrud.data.map((r) => ({ value: r.id, label: `#${r.id} — ${r.cliente} (Hab. ${r.habitacion})` })),
      hint: "Selecciona la reserva a la que pertenece el pago", cols: 2,
    },
    { key: "monto",     label: "Monto (S/.)",    required: true, type: "number", placeholder: "240.00", min: 0.01, hint: "Debe ser mayor a 0" },
    { key: "fechaPago", label: "Fecha de Pago",  required: true, type: "date",   max: today, hint: "No puede ser una fecha futura" },
    {
      key: "metodoPago", label: "Método de Pago", required: true, type: "select",
      hint: "Efectivo, Tarjeta, Yape, Plin, etc.",
      options: [
        { value: "EFECTIVO",        label: "Efectivo" },
        { value: "TARJETA_CREDITO", label: "Tarjeta de Crédito" },
        { value: "TARJETA_DEBITO",  label: "Tarjeta de Débito" },
        { value: "TRANSFERENCIA",   label: "Transferencia" },
        { value: "YAPE",            label: "Yape" },
        { value: "PLIN",            label: "Plin" },
      ],
      cols: 2,
    },
  ];

  const getFormData = (row: any) =>
    row ? { idReserva: row.reservaId, monto: row.monto, fechaPago: row.fecha, metodoPago: row.metodo } : { fechaPago: today };

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

  return (
    <>
      <DataTable
        title="Pagos" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "reserva",  label: "Reserva" },
          { key: "montoFmt", label: "Monto" },
          { key: "fecha",    label: "Fecha" },
          { key: "metodo",   label: "Método" },
          {
            key: "_acciones", label: "Acciones", sortable: false,
            render: (_: any, row: any) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { m.openEdit(row); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => downloadPdf(`/api/pagos/${row.id}/ticket`, `ticket-pago-${row.id}.pdf`)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
                >
                  <Receipt className="w-3 h-3" /> Ticket
                </button>
              </div>
            ),
          },
        ]}
        onNew={m.openNew}
        headerExtra={
          <button onClick={() => downloadPdf("/api/pagos/pdf/reporte", "reporte-pagos.pdf")}
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
    </>
  );
}
