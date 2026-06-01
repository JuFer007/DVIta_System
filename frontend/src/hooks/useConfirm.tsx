import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const [loading, setLoading] = useState(false);
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    setLoading(false);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    resolveRef.current(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
          style={{ backgroundColor: "rgba(20,8,2,0.65)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(163,48,48,0.12)" }}
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 text-[15px]">
                  {options.title}
                </h3>
              </div>
              <button onClick={handleCancel}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-[13px] text-neutral-600 leading-relaxed">
                {options.description || "¿Estás seguro? Esta acción no se puede deshacer."}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100">
              <button onClick={handleCancel} disabled={loading}
                className="px-5 py-2 border border-neutral-200 text-neutral-600 text-[12px] font-semibold rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                {options.cancelText || "Cancelar"}
              </button>
              <button onClick={handleConfirm} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-[12px] font-bold uppercase tracking-wide rounded-lg transition-colors disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando…
                  </span>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> {options.confirmText || "Eliminar"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  return ctx;
}
