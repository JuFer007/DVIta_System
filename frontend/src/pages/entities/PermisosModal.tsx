import { useState, useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import { permisosService } from "../../services/api";
import { useToast } from "../../components/Toast";

const MODULOS = [
  { key: "CLIENTES",         label: "Clientes" },
  { key: "EMPLEADOS",        label: "Empleados" },
  { key: "HABITACIONES",     label: "Habitaciones" },
  { key: "TIPOS_HABITACION", label: "Tipos de Habitación" },
  { key: "RESERVAS",         label: "Reservas" },
  { key: "PAGOS",            label: "Pagos" },
  { key: "USUARIOS",         label: "Usuarios" },
  { key: "INCIDENCIAS",      label: "Incidencias" },
];

interface Props {
  open: boolean;
  usuarioId: number;
  usuarioNombre: string;
  readOnly?: boolean;
  onClose: () => void;
}

export default function PermisosModal({ open, usuarioId, usuarioNombre, readOnly, onClose }: Props) {
  const toast = useToast();
  const [permisos, setPermisos] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !usuarioId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await permisosService.getByUsuario(usuarioId);
        const map: Record<string, boolean> = {};
        (data || []).forEach((p: any) => { map[p.modulo] = p.puedeAcceder; });
        setPermisos(map);
      } catch {
        setPermisos({});
      } finally {
        setLoading(false);
      }
    })();
  }, [open, usuarioId]);

  const toggle = (key: string) => {
    setPermisos((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const payload = MODULOS.map((m) => ({ usuario: { idUsuario: usuarioId }, modulo: m.key, puedeAcceder: permisos[m.key] !== false }));
      await permisosService.update(usuarioId, payload);
      toast.showToast("success", "Permisos actualizados", `Permisos de ${usuarioNombre} guardados`);
      onClose();
    } catch (e: any) {
      toast.showToast("fail", "Error", e?.message || "No se pudieron guardar los permisos");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-brand-900">
          <Shield className="w-5 h-5 text-brand-300" />
          <div>
            <h3 className="text-[15px] font-bold text-white">Permisos: {usuarioNombre}</h3>
            <p className="text-[11px] text-brand-400">
              {readOnly
                ? "Acceso completo a todos los módulos (miembro del equipo)"
                : "Activa o desactiva módulos para este usuario"}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {MODULOS.map((mod) => (
                <label
                  key={mod.key}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${readOnly ? "" : "hover:bg-brand-50 cursor-pointer"}`}
                >
                  <span className="text-[14px] font-medium text-neutral-800">{mod.label}</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={permisos[mod.key] !== false}
                      onChange={() => !readOnly && toggle(mod.key)}
                      disabled={readOnly}
                      className="sr-only peer"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow after:transition-all peer-checked:after:translate-x-5 ${readOnly ? "bg-brand-500" : "bg-neutral-300 peer-checked:bg-brand-500"}`} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose}
            className="px-4 py-2 text-[12px] font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
            {readOnly ? "Cerrar" : "Cancelar"}
          </button>
          {!readOnly && (
            <button onClick={handleGuardar} disabled={saving || loading}
              className="px-4 py-2 text-[12px] font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Guardar permisos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
