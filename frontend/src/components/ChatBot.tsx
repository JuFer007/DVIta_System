import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Send, Bot, ChevronDown, Sparkles,
  CalendarPlus, Bed, Phone, HelpCircle, LogOut,
  ArrowLeft, XCircle, Search, Eye, Coins,
  PhoneCall, MapPin, Gift, Clock, type LucideIcon,
} from "lucide-react";

const API_URL = "http://localhost:8000";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
}

interface MenuItem {
  text: string;
  icon: LucideIcon;
  action: string;
}

interface MenuConfig {
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const MENU_ICONS: Record<string, LucideIcon> = {
  "1": CalendarPlus, "2": Bed, "3": Phone, "4": HelpCircle, "5": HelpCircle, "0": LogOut,
};

const SUBMENU_ICONS: Record<string, Record<string, LucideIcon>> = {
  RESERVAS: { "1": CalendarPlus, "2": XCircle, "3": Search, "0": ArrowLeft },
  HABITACIONES: { "1": Eye, "2": Coins, "0": ArrowLeft },
  CONTACTO: { "1": PhoneCall, "2": MapPin, "3": Gift, "4": Clock, "0": ArrowLeft },
  INFORMACION: { "1": MapPin, "2": PhoneCall, "3": Gift, "4": Clock, "5": Gift, "0": ArrowLeft },
};

const MENU_HEADER_ICONS: Record<string, LucideIcon> = {
  "MENU PRINCIPAL": Bed,
  RESERVAS: CalendarPlus,
  HABITACIONES: Bed,
  "CONTACTO / SERVICIOS": Phone,
  INFORMACION: HelpCircle,
};

function getTime() {
  return new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function getSessionId(): string {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

async function sendToChatbot(text: string, sessionId: string): Promise<string> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, session_id: sessionId }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Error de conexion");
    throw new Error(`Error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.reply;
}

function isMenuText(text: string): string | false {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0 && /^=== .+ ===$/.test(lines[0])) {
    return lines[0].replace(/^=== /, "").replace(/ ===$/, "");
  }
  return false;
}

function parseMenuItems(text: string): { title: string; items: string[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.replace(/^=== /, "").replace(/ ===$/, "") || "";
  const items = lines.slice(1).filter((l) => /^\d+\.\s/.test(l));
  return { title, items };
}

function getIconForOption(menuTitle: string, key: string): LucideIcon {
  const sub = SUBMENU_ICONS[menuTitle];
  if (sub && sub[key]) return sub[key];
  return MENU_ICONS[key] || HelpCircle;
}

function getMenuHeaderIcon(menuTitle: string): LucideIcon {
  return MENU_HEADER_ICONS[menuTitle] || Bot;
}

function MenuCard({
  item,
  onClick,
  menuTitle,
}: {
  item: string;
  onClick: (action: string) => void;
  menuTitle: string;
}) {
  const match = item.match(/^(\d+)\.\s*(.+)/);
  if (!match) return null;
  const key = match[1];
  const label = match[2];
  const Icon = getIconForOption(menuTitle, key);

  return (
    <button
      onClick={() => onClick(key)}
      className="flex items-center gap-3 w-full px-4 py-3 bg-white rounded-xl border border-neutral-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left shadow-sm active:scale-[0.98]"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-brand-700" />
      </div>
      <span className="text-[13px] font-medium text-neutral-800 flex-1">{label}</span>
      <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">{key}</span>
    </button>
  );
}

function MenuView({ text, onOptionClick }: { text: string; onOptionClick: (action: string) => void }) {
  const { title, items } = parseMenuItems(text);
  if (!title) return null;
  const HeaderIcon = getMenuHeaderIcon(title);

  return (
    <div className="w-full space-y-2" style={{ minWidth: "280px" }}>
      <div className="flex items-center gap-2 px-1 mb-1">
        <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center">
          <HeaderIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="font-bold text-[14px] text-brand-900 tracking-tight">{title}</h3>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <MenuCard key={item} item={item} onClick={onOptionClick} menuTitle={title} />
        ))}
      </div>
    </div>
  );
}

function renderText(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = withBold.split("\n");
  const out: string[] = [];
  let block: 'ul' | 'ol' | 'indent' | null = null;

  function closeBlock() {
    if (block === 'ul') out.push('</ul>');
    else if (block === 'ol') out.push('</ol>');
    else if (block === 'indent') out.push('</div>');
    block = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();

    if (!t) { closeBlock(); out.push("<br />"); continue; }

    const bulletMatch = t.match(/^[•\-]\s+(.*)/);
    const numberMatch = t.match(/^(\d+)\.\s+(.*)/);
    const indent = raw.startsWith("  ");

    if (bulletMatch) {
      if (block !== 'ul') { closeBlock(); out.push('<ul class="chat-list">'); block = 'ul'; }
      const sub: string[] = [];
      while (i + 1 < lines.length && lines[i + 1].startsWith("  ") && !lines[i + 1].trim().startsWith("**")) {
        sub.push(lines[i + 1].trim());
        i++;
      }
      out.push(`<li>${bulletMatch[1]}${sub.length ? `<span class="chat-li-sub">${sub.join("<br />")}</span>` : ""}</li>`);
    } else if (numberMatch) {
      if (block !== 'ol') { closeBlock(); out.push('<ol class="chat-list">'); block = 'ol'; }
      out.push(`<li value="${numberMatch[1]}">${numberMatch[2]}</li>`);
    } else if (indent && t.startsWith("**")) {
      if (block !== 'indent') { closeBlock(); out.push('<div class="chat-indent">'); block = 'indent'; }
      out.push(`<div class="chat-indent-item">${t}</div>`);
    } else if (indent && block === 'indent') {
      out.push(`<div class="chat-indent-sub">${t}</div>`);
    } else {
      closeBlock();
      out.push(raw);
    }
  }

  closeBlock();
  return out.join("\n");
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "bot",
      text: "Hola! Soy **DViBot**, tu asistente de Hospedaje D'Vita.\n\nEscribe **menu** para ver las opciones.",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (open) setUnread(0);
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatRef.current && !chatRef.current.contains(e.target as Node) &&
        toggleRef.current && !toggleRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const reply = await sendToChatbot(text, sessionId.current);
      const botMsg: Message = { id: Date.now() + 1, from: "bot", text: reply, time: getTime() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: Date.now() + 1,
        from: "bot",
        text: "No pude conectarme al servicio en este momento. Intenta de nuevo o llamanos al **+51 922 626 148**.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setTyping(false);
    }
  }, []);

  const handleMenuOption = useCallback((optionKey: string) => {
    sendMessage(optionKey);
  }, [sendMessage]);

  return (
    <>
      <button
        ref={toggleRef}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-all duration-300 flex items-center justify-center group shadow-lg"
      >
        {open ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-30" />
        )}
      </button>

      <div
        ref={chatRef}
        className={`fixed bottom-28 right-6 z-50 w-[380px] bg-white rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right shadow-xl ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ maxHeight: "680px" }}
      >
        <div className="flex items-center gap-3 px-6 py-5 bg-brand-900 flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-200" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-brand-900" />
          </div>
          <div className="flex-1 text-white">
            <p className="font-semibold text-[15px]">DViBot</p>
            <p className="text-[10px] text-brand-300 flex items-center gap-1 opacity-80">
              <Sparkles className="w-2.5 h-2.5" /> En linea
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-brand-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-neutral-50 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
.scrollbar-hide::-webkit-scrollbar { display: none; }
.chat-list { margin: 6px 0 8px 0; padding: 0 0 0 20px; list-style: disc; }
.chat-list li { margin-bottom: 5px; line-height: 1.5; }
.chat-list li::marker { color: #7c3aed; }
ol.chat-list { list-style: decimal; }
ol.chat-list li::marker { color: #7c3aed; font-weight: 600; }
.chat-li-sub { display: block; font-size: 12px; color: #6b7280; margin-top: 2px; padding-left: 4px; }
.chat-indent { margin: 6px 0 8px 4px; padding: 0; border-left: 2px solid #e5e7eb; }
.chat-indent-item { padding: 3px 0 3px 12px; line-height: 1.5; font-size: 13px; }
.chat-indent-sub { padding: 1px 0 1px 12px; color: #6b7280; font-size: 12px; line-height: 1.4; }
`}</style>

          {messages.map((msg) => {
            const menuTitle = msg.from === "bot" ? isMenuText(msg.text) : false;
            return (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && menuTitle ? (
                  <div className="bg-white rounded-[1.5rem] p-4 border border-neutral-100 shadow-sm">
                    <MenuView text={msg.text} onOptionClick={handleMenuOption} />
                  </div>
                ) : (
                  <div
                    className={`px-4 py-3 rounded-[1.2rem] text-[13px] leading-relaxed max-w-[290px] ${
                      msg.from === "user"
                        ? "bg-brand-600 text-white rounded-br-none"
                        : "bg-white text-neutral-800 rounded-bl-none border border-neutral-100 shadow-sm"
                    }`}
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{
                      __html: msg.from === "bot" ? renderText(msg.text) : msg.text,
                    }}
                  />
                )}
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white rounded-[1.2rem] rounded-bl-none px-4 py-3 border border-neutral-100 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-300 animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-3 px-5 py-4 bg-white border-t border-neutral-50 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !typing && sendMessage(input)}
            placeholder={typing ? "DViBot está escribiendo..." : "Escribe tu mensaje..."}
            disabled={typing}
            className="flex-1 px-5 py-3 text-[13px] bg-neutral-100 border-none rounded-full outline-none focus:bg-neutral-200/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-90 disabled:opacity-30 disabled:hover:scale-100 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
