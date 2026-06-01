import { Bed, Pencil } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { tiposService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

const mapTipo = (t: any) => ({
  id: t.idTipoHabitacion,
  descripcion: t.descripcion,
  precio: Number(t.precio),
  precioFmt: `S/.${Number(t.precio).toFixed(2)}`,
  _raw: t,
});

const DEMO: any[] = [
  { id: 1, descripcion: "Habitación Estándar", precio: 60,  precioFmt: "S/.60.00",  _raw: {} },
  { id: 2, descripcion: "Suite Deluxe",        precio: 120, precioFmt: "S/.120.00", _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "descripcion", label: "Descripción", required: true, placeholder: "Ej: Suite Deluxe", cols: 2 },
  { key: "precio",      label: "Precio (S/.)", required: true, type: "number", placeholder: "120.00", min: 0.01, hint: "Precio base por noche — debe ser mayor a 0" },
];

export default function TiposPage() {
  const crud = useCrud(tiposService, mapTipo, DEMO);
  const m = useModalState();
  const toast = useToast();

  const getFormData = (row: any) =>
    row ? { descripcion: row.descripcion, precio: row.precio } : null;

  const handleSave = async (form: any) => {
    const precio = parseFloat(form.precio);
    if (isNaN(precio) || precio <= 0) {
      toast.showToast("fail", "Validación", "El precio debe ser un número mayor a 0");
      return;
    }
    if (!form.descripcion?.trim()) {
      toast.showToast("fail", "Validación", "La descripción es obligatoria");
      return;
    }
    const payload = { descripcion: form.descripcion, precio };
    const esNuevo = !m.editing;
    const ok = esNuevo ? await crud.create(payload) : await crud.update(m.editing.id, payload);
    if (ok) {
      toast.showToast("success",
        esNuevo ? "Tipo de habitación creado" : "Tipo de habitación actualizado",
        `${form.descripcion} — S/.${precio.toFixed(2)}`);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  return (
    <>
      <DataTable
        title="Tipos de Habitación" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "descripcion", label: "Descripción" },
          { key: "precioFmt",   label: "Precio" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit}
      />
      <EntityModal
        open={m.modalOpen} title="Tipo de Habitación" icon={<Bed className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
    </>
  );
}
