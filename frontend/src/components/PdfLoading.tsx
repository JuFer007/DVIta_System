import { useState, useEffect } from "react";
import { FileText } from "lucide-react";

export default function PdfLoadingOverlay() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const end = () => setLoading(false);
    window.addEventListener("pdf-loading-start", start);
    window.addEventListener("pdf-loading-end", end);
    return () => {
      window.removeEventListener("pdf-loading-start", start);
      window.removeEventListener("pdf-loading-end", end);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(20,8,2,0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="bg-white rounded-xl p-10 flex flex-col items-center gap-5"
        style={{
          boxShadow: "0 32px 80px rgba(29,13,4,0.35), 0 0 0 1px rgba(201,169,110,0.15)",
        }}
      >
        <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center">
          <FileText className="w-7 h-7 text-brand-600" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-gray-800">Generando PDF…</p>
          <p className="text-[12px] text-gray-400">Esto puede tomar unos segundos</p>
        </div>
      </div>
    </div>
  );
}
