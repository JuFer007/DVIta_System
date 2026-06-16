import { useState, useMemo } from "react";
import { Building2, Pencil, RotateCcw } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { useCrud } from "../../hooks/useCrud";
import { areasService } from "../../services/api";
import { useModalState } from "../../hooks/useModalState";
import { useToast } from "../../components/Toast";

const PRIORIDADES = [
  { value: "BAJA",   label: "Baja" },
  { value: "MEDIA",  label: "Media" },
  { value: "ALTA",   label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
];

const PRIORIDAD_NIVEL: Record<string, number> = { BAJA: 1, MEDIA: 2, ALTA: 3, URGENTE: 4 };

const mapArea = (a: any) => ({
  id: a.idArea,
  nombre: a.nombre,
  prioridadBase: a.prioridadBase,
  nivelPrioridad: a.nivelPrioridad,
  descripcion: a.descripcion || "",
  activo: a.activo,
  _raw: a,
});

const DEMO: any[] = [
  { id: 1, nombre: "RESERVAS", prioridadBase: "URGENTE", nivelPrioridad: 4, descripcion: "Reservas", activo: true, _raw: {} },
  { id: 2, nombre: "RECEPCION", prioridadBase: "ALTA", nivelPrioridad: 3, descripcion: "Recepción", activo: true, _raw: {} },
];

const FIELDS: ModalField[] = [
  { key: "nombre", label: "Nombre", required: true, placeholder: "Ej: RESERVAS", cols: 1 },
  { key: "prioridadBase", label: "Prioridad Base", required: true, type: "select", options: PRIORIDADES, cols: 1 },
  { key: "descripcion", label: "Descripción", placeholder: "Opional", cols: 2 },
];

export default function AreasPage() {
  const crud = useCrud(areasService, mapArea, DEMO);
  const m = useModalState();
  const toast = useToast();

  const getFormData = (row: any) =>
    row ? {
      nombre: row.nombre,
      prioridadBase: row.prioridadBase,
      descripcion: row.descripcion,
    } : { prioridadBase: "MEDIA" };

  const handleSave = async (form: any) => {
    if (!form.nombre?.trim()) {
      toast.showToast("fail", "Validación", "El nombre es obligatorio");
      return;
    }
    const nivel = PRIORIDAD_NIVEL[form.prioridadBase] || 2;
    const payload = {
      nombre: form.nombre,
      prioridadBase: form.prioridadBase,
      nivelPrioridad: nivel,
      descripcion: form.descripcion || "",
      activo: true,
    };
    const esNuevo = !m.editing;
    const ok = esNuevo ? await crud.create(payload) : await crud.update(m.editing.id, payload);
    if (ok) {
      toast.showToast("success",
        esNuevo ? "Área creada" : "Área actualizada",
        payload.nombre);
      m.closeModal();
    } else if (crud.saveError) {
      toast.showToast("fail", "Error al guardar", crud.saveError);
    }
  };

  const prioridadColor: Record<string, string> = {
    BAJA: "bg-neutral-100 text-neutral-600",
    MEDIA: "bg-blue-100 text-blue-700",
    ALTA: "bg-orange-100 text-orange-700",
    URGENTE: "bg-red-100 text-red-700",
  };

  return (
    <>
      <DataTable
        title="Áreas" data={crud.data} loading={crud.loading} error={crud.error}
        columns={[
          { key: "nombre", label: "Área" },
          {
            key: "prioridadBase", label: "Prioridad Base",
            render: (v: string) => (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${prioridadColor[v] || ""}`}>
                {PRIORIDADES.find(p => p.value === v)?.label || v}
              </span>
            ),
          },
          { key: "descripcion", label: "Descripción" },
        ]}
        onNew={m.openNew} onEdit={m.openEdit}
      />
      <EntityModal
        open={m.modalOpen} title="Área" icon={<Building2 className="w-4 h-4" />}
        fields={FIELDS} data={getFormData(m.editing)}
        loading={crud.saving} error={crud.saveError}
        onClose={m.closeModal} onSave={handleSave}
      />
    </>
  );
}
