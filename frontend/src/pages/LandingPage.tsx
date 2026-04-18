import { useState, useEffect, useRef } from "react";
import styles from "../styles/LandingPage.module.css";
import { Hotel, Send, Bot } from "lucide-react";
import logo from "../assets/DVita_Logo.png";

/* ─── Types ─────────────────────────────────── */
interface Message {
  role: "bot" | "user";
  text: string;
}

/* ─── Chatbot panel ──────────────────────────── */
function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "¡Hola! Soy el asistente de Hospedaje D'Vita. ¿En qué puedo ayudarte hoy?" },
    { role: "bot", text: "Puedo ayudarte con consultas sobre habitaciones, tarifas y disponibilidad. 🏨" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system:
            "Eres el asistente virtual de Hospedaje D'Vita, un hospedaje acogedor en Perú. " +
            "Respondes preguntas sobre habitaciones (Estándar S/.60, Suite S/.120, Familiar S/.180), " +
            "disponibilidad, reservas, servicios y políticas del hotel. " +
            "Sé amable, conciso y en español. Si no sabes algo, pide que llamen al hospedaje.",
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const reply =
        data?.content?.map((b: any) => b.text || "").join("") ||
        "Lo siento, no pude procesar tu consulta. ¿Puedo ayudarte con algo más?";
      setMessages(m => [...m, { role: "bot", text: reply }]);
    } catch {
      setMessages(m => [
        ...m,
        { role: "bot", text: "Hubo un problema de conexión. Por favor intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Panel */}
      <div className={`${styles.chatPanel} ${open ? styles.chatOpen : ""}`}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.chatAvatar}><BotIcon size={18} /></div>
            <div>
              <p className={styles.chatName}>Asistente D'Vita</p>
              <span className={styles.chatStatus}><span className={styles.statusDot} />En línea</span>
            </div>
          </div>
          <button className={styles.chatClose} onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className={styles.chatBody} ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "bot" ? styles.botMsg : styles.userMsg}>
              {m.role === "bot" && <BotIcon size={13} />}
              <span>{m.text}</span>
            </div>
          ))}
          {loading && (
            <div className={styles.botMsg}>
              <BotIcon size={13} />
              <span className={styles.typing}><span /><span /><span /></span>
            </div>
          )}
        </div>

        <div className={styles.chatFooter}>
          <input
            className={styles.chatInput}
            placeholder="Escribe tu consulta…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={loading}
          />
          <button className={styles.chatSend} onClick={send} disabled={loading || !input.trim()}>
            <SendIcon />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        className={`${styles.fab} ${open ? styles.fabActive : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir asistente"
      >
        {open ? <span style={{ fontSize: 20 }}>✕</span> : <BotIcon size={22} />}
        {!open && <span className={styles.fabPing} />}
      </button>
    </>
  );
}

/* ─── Landing page ───────────────────────────── */
export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={styles.root}>
      {/* Navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
        <div className={styles.navBrand}>
            <img src={logo} alt="D'Vita" style={{ width: 28, height: 28 }} />
            <span>D'Vita</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#habitaciones">Habitaciones</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
        </div>
        <button className={styles.navLoginBtn} onClick={onLogin}>
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Hospedaje de confianza en Perú</span>
          <h1 className={styles.heroTitle}>
            Tu descanso,<br />nuestra prioridad
          </h1>
          <p className={styles.heroSub}>
            Disfruta de habitaciones cómodas, atención personalizada y un ambiente que te hace sentir en casa.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.ctaPrimary} onClick={onLogin}>Reservar ahora</button>
            <a href="#habitaciones" className={styles.ctaSecondary}>Ver habitaciones</a>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <span>Descubre más</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>
      </section>

      {/* Habitaciones */}
      <section id="habitaciones" className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionTag}>Nuestras habitaciones</span>
          <h2 className={styles.sectionTitle}>Elige tu espacio ideal</h2>
          <div className={styles.roomsGrid}>
            {ROOMS.map((r, i) => (
              <div key={i} className={styles.roomCard} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.roomEmoji}>{r.emoji}</div>
                <div className={styles.roomInfo}>
                  <h3 className={styles.roomName}>{r.name}</h3>
                  <p className={styles.roomDesc}>{r.desc}</p>
                  <div className={styles.roomFeatures}>
                    {r.features.map((f, j) => <span key={j}>{f}</span>)}
                  </div>
                  <div className={styles.roomPrice}>
                    <strong>S/.{r.price}</strong>
                    <span>/ noche</span>
                  </div>
                  <button className={styles.roomBtn} onClick={onLogin}>Reservar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionTag}>¿Por qué elegirnos?</span>
          <h2 className={styles.sectionTitle}>Servicios incluidos</h2>
          <div className={styles.servicesGrid}>
            {SERVICES.map((s, i) => (
              <div key={i} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{s.icon}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className={styles.contactSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.contactTitle}>¿Necesitas más información?</h2>
          <p className={styles.contactSub}>
            Usa nuestro asistente virtual o contáctanos directamente.
          </p>
          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <span>📞</span>
              <div>
                <strong>Teléfono</strong>
                <p>+51 987 654 321</p>
              </div>
            </div>
            <div className={styles.contactCard}>
              <span>📧</span>
              <div>
                <strong>Correo</strong>
                <p>info@dvita.pe</p>
              </div>
            </div>
            <div className={styles.contactCard}>
              <span>📍</span>
              <div>
                <strong>Ubicación</strong>
                <p>Chiclayo, Lambayeque</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <HotelIcon size={20} />
          <span>Hospedaje D'Vita © 2025</span>
        </div>
        <p className={styles.footerSub}>Todos los derechos reservados</p>
      </footer>

      {/* Chatbot flotante */}
      <ChatBot />
    </div>
  );
}

/* ─── Data ───────────────────────────────────── */
const ROOMS = [
  {
    name: "Habitación Estándar",
    emoji: "🛏️",
    desc: "Cómoda y acogedora, perfecta para viajeros individuales o parejas.",
    features: ["TV Cable", "Baño privado", "WiFi", "Agua caliente"],
    price: 60,
  },
  {
    name: "Suite",
    emoji: "🌟",
    desc: "Espacio amplio con sala de estar y vista panorámica al exterior.",
    features: ["TV 50\"", "Sala de estar", "Mini bar", "Vista panorámica"],
    price: 120,
  },
  {
    name: "Habitación Familiar",
    emoji: "👨‍👩‍👧‍👦",
    desc: "Diseñada para familias, con 3 camas y espacio adicional de juegos.",
    features: ["3 camas", "Espacio adicional", "TV Cable", "Frigobar"],
    price: 180,
  },
];

const SERVICES = [
  { icon: "🍳", title: "Desayuno incluido", desc: "Empieza el día con un desayuno completo a la peruana." },
  { icon: "🔒", title: "Seguridad 24/7", desc: "Personal de seguridad y cámaras en todo el hospedaje." },
  { icon: "🅿️", title: "Estacionamiento", desc: "Cochera gratuita para todos nuestros huéspedes." },
  { icon: "🌐", title: "WiFi de alta velocidad", desc: "Conexión estable en todas las habitaciones y áreas comunes." },
  { icon: "🧹", title: "Limpieza diaria", desc: "Servicio de limpieza y cambio de ropa de cama cada día." },
  { icon: "📞", title: "Recepción 24h", desc: "Atención al cliente disponible las 24 horas del día." },
];

/* ─── Icons ──────────────────────────────────── */
function HotelIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect x="4" y="12" width="28" height="20" rx="2" fill="currentColor" opacity=".15" />
      <rect x="8" y="8" width="20" height="24" rx="2" fill="currentColor" opacity=".3" />
      <rect x="12" y="4" width="12" height="28" rx="2" fill="currentColor" />
      <rect x="15" y="20" width="6" height="12" rx="1" fill="white" opacity=".8" />
      <rect x="14" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7" />
      <rect x="19" y="11" width="3" height="3" rx=".5" fill="white" opacity=".7" />
    </svg>
  );
}
function BotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M12 2a3 3 0 013 3v6H9V5a3 3 0 013-3z" />
      <path d="M8 11V7M16 11V7M9 16h.01M15 16h.01" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}