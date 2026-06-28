import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";

export default function PdfLoadingOverlay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = () => { setLoading(true); setError(null); };
    const end = () => setLoading(false);
    const onError = (e: any) => { setError(e.detail || "Error desconocido"); };
    window.addEventListener("pdf-loading-start", start);
    window.addEventListener("pdf-loading-end", end);
    window.addEventListener("pdf-loading-error", onError);
    return () => {
      window.removeEventListener("pdf-loading-start", start);
      window.removeEventListener("pdf-loading-end", end);
      window.removeEventListener("pdf-loading-error", onError);
    };
  }, []);

  if (!loading && !error) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(20,8,2,0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      onClick={() => { setLoading(false); setError(null); }}
    >
      <div
        className="bg-white rounded-xl p-10 flex flex-col items-center gap-5 max-w-sm"
        style={{
          boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(201,169,110,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <>
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <p className="text-[15px] font-semibold text-gray-800">Error al generar PDF</p>
            <p className="text-[12px] text-red-600 text-center break-words">{error}</p>
            <button
              onClick={() => { setLoading(false); setError(null); }}
              className="px-4 py-2 text-[12px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center">
              <FileText className="w-7 h-7 text-brand-600" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-[15px] font-semibold text-gray-800">Generando PDF…</p>
              <p className="text-[12px] text-gray-400">Esto puede tomar unos segundos</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
