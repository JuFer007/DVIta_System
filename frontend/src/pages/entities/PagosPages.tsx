// ─── PagosPage ────────────────────────────────────────────────────────────────
import { CreditCard } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import ConfirmModal from "../../components/ConfirmModal";
import { useCrud } from "../../hooks/useCrud";
import { pagosService, reservasService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";

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

  const today = new Date().toISOString().split("T")[0];

  const fields: ModalField[] = [
    {
      key: "idReserva", label: "Reserva", required: true, type: "select",
      options: reservasCrud.data.map((r) => ({ value: r.id, label: `#${r.id} — ${r.cliente} (Hab. ${r.habitacion})` })),
      cols: 2,
    },
    { key: "monto",     label: "Monto (S/.)",    required: true, type: "number", placeholder: "240.00" },
    { key: "fechaPago", label: "Fecha de Pago",  required: true, type: "date",   max: today },
    {
      key: "metodoPago", label: "Método de Pago", required: true, type: "select",
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
    const payload = { reserva: { idReserva: Number(form.idReserva) }, monto: parseFloat(form.monto), fechaPago: form.fechaPago, metodoPago: form.metodoPago };
    const ok = m.editing ? await crud.update(m.editing.id, payload) : await crud.create(payload);
    if (ok) m.closeModal();
  };

  const handleDelete = async () => {
    if (!m.deleting) return;
    const ok = await crud.remove(m.deleting.id);
    if (ok) m.closeDelete();
  };

  return (
    <>
      <DataTable
        title="Pagos" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "id",       label: "ID" },
          { key: "reserva",  label: "Reserva" },
          { key: "montoFmt", label: "Monto" },
          { key: "fecha",    label: "Fecha" },
          { key: "metodo",   label: "Método" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit} onDelete={m.openDelete}
      />
      <EntityModal
        open={m.modalOpen} title="Pago" icon={<CreditCard className="w-4 h-4" />}
        fields={fields} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
      <ConfirmModal
        open={m.deleteOpen} title="pago"
        description={`¿Eliminar el pago #${m.deleting?.id} de ${m.deleting?.montoFmt}?`}
        loading={crud.saving} onClose={m.closeDelete} onConfirm={handleDelete}
      />
    </>
  );
}
