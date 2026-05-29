import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

type ToastType = "success" | "warning" | "fail";

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
    success: CheckCircle,
    warning: AlertTriangle,
    fail: AlertCircle,
};

const COLORS = {
    success: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: "text-emerald-500",
        title: "text-emerald-800",
        text: "text-emerald-700",
    },
    warning: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "text-amber-500",
        title: "text-amber-800",
        text: "text-amber-700",
    },
    fail: {
        bg: "bg-red-50",
        border: "border-red-200",
        icon: "text-red-500",
        title: "text-red-800",
        text: "text-red-700",
    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    const Icon = ICONS[toast.type];
                    const c = COLORS[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto ${c.bg} ${c.border} border rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 animate-slide-in`}
                        >
                            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${c.icon}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${c.title}`}>{toast.title}</p>
                                <p className={`text-xs mt-0.5 ${c.text}`}>{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className={`flex-shrink-0 ${c.icon} hover:opacity-70 transition-opacity`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
    return ctx;
}
