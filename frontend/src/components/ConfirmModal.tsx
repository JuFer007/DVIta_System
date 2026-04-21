import { useRef } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onClose,
  loading,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(20,8,2,0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(163,48,48,0.12)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 text-[15px]">Eliminar {title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-[13px] text-neutral-600 leading-relaxed">
            {description ||
              `¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold uppercase tracking-wide rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Eliminando…
              </span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
