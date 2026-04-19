import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, ChevronDown, Sparkles, Handshake } from "lucide-react";

interface Message {
    id: number;
    from: "bot" | "user";   
    text: string;
    time: string;
}

const QUICK_REPLIES = [
    "¿Cuáles son las tarifas?",
    "¿Tienen disponibilidad?",
    "¿Cómo reservo?",
    "Servicios incluidos",
];

const BOT_RESPONSES: Record<string, string> = {
    tarifa: "Nuestras tarifas son: Estándar S/. 60/noche, Suite Deluxe S/. 120/noche y Familiar S/. 180/noche. Todos incluyen desayuno y WiFi.",
    disponibilidad: "Para verificar disponibilidad en tiempo real, puedes usar el formulario de reserva o llamarnos al +51 922 626 148. ¡Respondemos rápido!",
    reserva: "Puedes reservar directamente desde nuestra web haciendo clic en 'Reservar ahora', o llamarnos al +51 922 626 148. También puedes escribirnos a DVitaHospedaje@gmail.com.",
    servicio: "Incluimos: desayuno a la peruana, WiFi de alta velocidad, estacionamiento techado gratuito y seguridad 24/7.",
    default: "Gracias por tu mensaje. Para más información puedes llamarnos al +51 922 626 148 o escribirnos a DVitaHospedaje@gmail.com. ¡Estaremos encantados de ayudarte!",
};

function getBotResponse(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("tarifa") || lower.includes("precio") || lower.includes("costo") || lower.includes("cuanto"))
        return BOT_RESPONSES.tarifa;
    if (lower.includes("disponib") || lower.includes("libre") || lower.includes("hay"))
        return BOT_RESPONSES.disponibilidad;
    if (lower.includes("reserv") || lower.includes("como") || lower.includes("cómo"))
        return BOT_RESPONSES.reserva;
    if (lower.includes("servicio") || lower.includes("incluy") || lower.includes("desayuno") || lower.includes("wifi"))
        return BOT_RESPONSES.servicio;
    return BOT_RESPONSES.default;
}

function getTime() {
    return new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
    {
        id: 0,
        from: "bot",
        text: "Hola! Soy el asistente de Hospedaje D'Vita. ¿En qué puedo ayudarte hoy?",
        time: getTime(),
    },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        if (open) setUnread(0);
    }, [messages, typing, open]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: getTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        setTimeout(() => {
        const botMsg: Message = {
            id: Date.now() + 1,
            from: "bot",
            text: getBotResponse(text),
            time: getTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setTyping(false);
        if (!open) setUnread((n) => n + 1);
        }, 1000);
    };

  return (
    <>
      {/* Botón flotante con Pulsación */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-all duration-300 flex items-center justify-center group"
      >
        {open ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-30" />
        )}
      </button>

      {/* Ventana de Chat */}
      <div
        className={`fixed bottom-28 right-6 z-50 w-[350px] bg-white rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right shadow-none border-none ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "620px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 bg-brand-900 flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-200" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-brand-900" />
          </div>
          <div className="flex-1 text-white">
            <p className="font-semibold text-[15px]">D'Vita Asistente</p>
            <p className="text-[10px] text-brand-300 flex items-center gap-1 opacity-80">
              <Sparkles className="w-2.5 h-2.5" /> En línea
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-brand-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes - Sin Scrollbars */}
        <div 
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-neutral-50 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                
                <div className={`px-4 py-3 rounded-[1.2rem] text-[13px] leading-relaxed ${
                msg.from === "user" 
                    ? "bg-brand-600 text-white rounded-br-none" 
                    : "bg-white text-neutral-800 rounded-bl-none border border-neutral-100 shadow-sm"
                }`}>
                
                <div className="flex items-center gap-2">
                    {msg.from === "bot" && msg.id === 0 && (
                    <Handshake size={22} className="text-yellow-500" />
                    )}
                    <span>{msg.text}</span>
                </div>
                </div>
            </div>
            ))}
          {typing && <div className="text-[11px] text-brand-400 animate-pulse pl-2 font-medium">Escribiendo...</div>}
          <div ref={bottomRef} />
        </div>

        {/* Sugerencias */}
        <div className="px-5 py-4 bg-white border-t border-neutral-50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="px-3 py-3 bg-brand-50 hover:bg-brand-100 text-brand-900 text-[11px] font-bold rounded-2xl border border-brand-100/50 transition-all text-center leading-tight flex items-center justify-center hover:scale-[1.02] active:scale-95"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-5 bg-white border-t border-neutral-50 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Haz una pregunta..."
            className="flex-1 px-5 py-3 text-[13px] bg-neutral-100 border-none rounded-full outline-none focus:bg-neutral-200/50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-90 disabled:opacity-30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
