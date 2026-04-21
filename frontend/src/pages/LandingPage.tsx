import { useState, useEffect, useRef } from "react";
import { Phone, Mail, MapPin, Wifi, Coffee, Car, Shield } from "lucide-react";
import ReservaModal from "./ReservaModal";
import ChatBot from "../components/ChatBot";

/* ─── DATA ─── */
const ROOMS = [
  {
    name: "Habitación Estándar",
    price: 60,
    badge: "Estándar",
    featured: true,
    desc: "Cómoda y equipada para una estadía ideal para viajes de negocio o descanso.",
    features: ["TV Cable", "Baño privado", "WiFi", "Agua caliente"],
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80",
  },
  {
    name: "Suite Deluxe",
    price: 120,
    badge: "Más popular",
    featured: true,
    desc: "Suite amplia con sala de estar separada. Perfecta para una estadía especial.",
    features: ['TV 50"', "Sala de estar", "Mini bar", "Vista exterior"],
    img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=700&q=80",
  },
  {
    name: "Habitación Familiar",
    price: 180,
    badge: "Familiar",
    featured: true,
    desc: "Espacio ideal para familias con 3 camas y área adicional para el descanso de todos.",
    features: ["3 camas", "Área adicional", "TV Cable", "Frigobar"],
    img: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=80",
  },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1600&q=80",

];

const SERVICES = [
  { Icon: Coffee, title: "Desayuno incluido",      desc: "Desayuno completo a la peruana cada mañana, sin costo adicional." },
  { Icon: Shield, title: "Seguridad 24/7",         desc: "Personal y cámaras en todas las áreas del hospedaje." },
  { Icon: Car,    title: "Estacionamiento",        desc: "Cochera techada y gratuita para todos nuestros huéspedes." },
  { Icon: Wifi,   title: "WiFi de alta velocidad", desc: "Conexión estable en habitaciones y áreas comunes." },
];

const CONTACTS = [
  { Icon: Phone,  label: "Teléfono",  value: "+51 922 626 148" },
  { Icon: Mail,   label: "Correo",    value: "DVitaHospedaje@gmail.com" },
  { Icon: MapPin, label: "Ubicación", value: "Chiclayo, Victor Raúl Haya de la Torre N° 281" },
];

/* ─── REVEAL HOOK ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── REVEAL WRAPPER ─── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── COMPONENT ─── */
export default function LandingPage({ onLogin }: { onLogin: () => void }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [scrolled, setScrolled]         = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalRoom, setModalRoom]       = useState("estandar");
 
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentImage((p) => (p + 1) % HERO_IMAGES.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);
 
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
 
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
 
  const openModal = (room = "estandar") => {
    setModalRoom(room);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-body">
      {/* ── Navbar ──*/}
      <nav
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-10 transition-all duration-300 ${
          scrolled ? "h-20 bg-brand-900 shadow-xl" : "h-[68px] bg-brand-900/92"
        }`}
        style={{ backdropFilter: scrolled ? "none" : "blur(16px)" }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0">
            <img src="/DVita_Logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-semibold text-white text-lg tracking-wide">D'Vita Hospedaje</span>
            <span className="text-[10px] font-medium text-brand-50 tracking-[0.25em] uppercase mt-0.5">
              Victor Raul Haya de la Torre N° 281
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-9">
          {["habitaciones", "servicios", "contacto"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[13px] font-bold text-white/90 hover:text-brand-200 transition-colors uppercase tracking-[0.06em] relative group"
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Iniciar sesión */}
          <button
            onClick={onLogin}
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 border border-white/25 text-white/80 text-[11px] font-semibold tracking-[0.1em] uppercase rounded-sm hover:border-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            Iniciar sesión
          </button>
          {/* Reservar */}
          <button
            onClick={() => openModal()}
            className="px-6 py-2.5 bg-brand-600 text-white text-[12px] font-bold tracking-[0.12em] uppercase rounded-sm hover:bg-brand-500 hover:-translate-y-px transition-all duration-200 shadow-md"
          >
            Reservar
          </button>
        </div>
      </nav>
      {/* ── Hero ── */}
      <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${img})`,
                opacity: i === currentImage ? 1 : 0,
                transform: i === currentImage ? "scale(1)" : "scale(1.04)",
                transition: "opacity 1.4s ease-in-out, transform 6s ease-in-out",
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(29,13,4,0.93) 0%, rgba(29,13,4,0.46) 45%, rgba(29,13,4,0.14) 100%)",
          }}
        />
        <div className="relative z-10 w-full px-10 pb-28 flex justify-between items-end max-w-[1300px] mx-auto">
          <div className="max-w-[600px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#C9A96E]" />
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C9A96E]">
                Chiclayo, Perú · Desde 2018
              </span>
            </div>
            <h1 className="font-display text-[clamp(48px,6vw,76px)] font-bold text-white leading-[1.05] mb-5 tracking-[-0.01em]">
              Tu descanso,<br />
              <em className="font-display italic text-[#E8D5A0]">nuestra pasión.</em>
            </h1>
            <p className="text-white/65 text-[15px] font-light leading-[1.75] max-w-[400px] mb-10 text-justify">
              Un refugio de confort en el corazón de Chiclayo. Habitaciones
              diseñadas con calidez, atención personalizada y todo lo que
              necesitas para sentirte en casa.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <button
                onClick={onLogin}
                className="px-9 py-[15px] bg-[#C9A96E] text-brand-950 text-[12px] font-bold tracking-[0.12em] uppercase rounded-sm hover:bg-[#E8D5A0] transition-all duration-200 hover:-translate-y-px"
              >
                Reservar ahora
              </button>
              <button
                onClick={() => scrollTo("habitaciones")}
                className="px-9 py-[15px] border border-white/35 text-white/85 text-[12px] font-medium tracking-[0.1em] uppercase rounded-sm hover:bg-white/10 hover:border-white/70 transition-all duration-200"
              >
                Ver habitaciones
              </button>
            </div>
          </div>
          <div className="text-right pb-1 hidden md:block">
            <div className="font-display text-[52px] font-bold text-[#C9A96E] leading-none">95%</div>
            <div className="text-[11px] font-medium text-white/50 tracking-[0.15em] uppercase mt-1">Satisfacción</div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className="h-[2px] transition-all duration-300 border-none cursor-pointer"
              style={{
                width: i === currentImage ? "44px" : "28px",
                background: i === currentImage ? "#C9A96E" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </section>
      {/* ── Rooms ── */}
      <section id="habitaciones" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <Reveal>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-500 mb-3.5">
              <span className="inline-block w-6 h-px bg-brand-400" />
              Alojamiento
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-[clamp(30px,3.5vw,44px)] font-bold text-brand-900 leading-[1.15] mb-3">
              Habitaciones para<br />cada necesidad
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <div className="w-14 h-px bg-[#C9A96E] mb-5" />
            <p className="text-gray-500 text-[15px] font-light leading-relaxed mb-12 max-w-lg">
              Espacios diseñados con calidez peruana, con todos los servicios que necesitas para un descanso perfecto.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {ROOMS.map((room, i) => (
              <Reveal key={i} delay={i * 120}>
                <div
                  className={`rounded-sm overflow-hidden border flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${
                    room.featured
                      ? "border-[#C9A96E] shadow-[0_0_0_1px_rgba(201,169,110,0.4)]"
                      : "border-brand-100 hover:border-brand-200 hover:shadow-[0_24px_60px_rgba(61,31,10,0.10)]"
                  }`}
                >
                  <div
                    className="relative h-52 bg-cover bg-center"
                    style={{ backgroundImage: `url(${room.img})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
                    <span
                      className={`absolute top-4 left-4 z-10 text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-[5px] rounded-sm ${
                        room.featured
                          ? "bg-[#C9A96E] text-brand-950"
                          : "bg-white/90 text-brand-700"
                      }`}
                    >
                      {room.badge}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-brand-900 text-[20px] mb-2">{room.name}</h3>
                    <p className="text-gray-500 text-[13px] font-light leading-relaxed mb-4 flex-1">{room.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {room.features.map((f) => (
                        <span
                          key={f}
                          className="text-[11px] font-medium bg-brand-50 text-brand-600 px-2.5 py-1 rounded-sm tracking-[0.04em]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-brand-100 pt-5">
                      <div>
                        <span className="font-display font-bold text-brand-700 text-[24px]">S/. {room.price}</span>
                        <span className="text-gray-400 text-xs ml-1 font-light">/ noche</span>
                      </div>
                      <button
                        onClick={onLogin}
                        className={`px-5 py-2.5 text-[11px] font-bold tracking-[0.1em] uppercase rounded-sm transition-all duration-200 ${
                          room.featured
                            ? "bg-[#C9A96E] text-brand-950 hover:bg-[#E8D5A0]"
                            : "bg-brand-600 text-white hover:bg-brand-500"
                        }`}
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* ── CTA Band ── */}
      <div className="py-20 px-10 bg-brand-50 border-y border-brand-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-10 flex-wrap">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-500 mb-3">
              <span className="inline-block w-6 h-px bg-brand-400" />
              Oferta directa
            </p>
            <h3 className="font-display text-[34px] font-bold text-brand-900 leading-[1.2] mb-2.5">
              ¿Listo para reservar<br />tu estadía ideal?
            </h3>
            <p className="text-gray-500 text-[14px] font-light leading-relaxed max-w-md">
              Reserva directamente con nosotros y obtén la mejor tarifa garantizada. Sin intermediarios ni comisiones.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onLogin}
              className="px-9 py-[15px] bg-brand-600 text-white text-[12px] font-bold tracking-[0.12em] uppercase rounded-sm hover:bg-brand-500 hover:-translate-y-px transition-all duration-200"
            >
              Reservar directamente
            </button>
            <a
              href="tel:+51987654321"
              className="px-9 py-[15px] border border-brand-300 text-brand-600 text-[12px] font-medium tracking-[0.1em] uppercase rounded-sm hover:border-brand-500 hover:text-brand-500 transition-all duration-200"
            >
              Llamar ahora
            </a>
          </div>
        </div>
      </div>
      {/* ── Services Section ── */}
      <section id="servicios" className="py-24 bg-brand-900 relative overflow-hidden">
        {/* Elemento decorativo sutil con la paleta brand */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-800/30 skew-x-12 translate-x-24" />
        
        <div className="max-w-5xl mx-auto px-8 relative z-10">
          <Reveal>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-300 mb-3.5">
              <span className="inline-block w-6 h-px bg-brand-400" />
              Experiencia D'Vita
            </p>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="font-display text-[clamp(30px,3.5vw,44px)] font-bold text-white leading-[1.15] mb-12">
              Servicios pensados<br />en tu comodidad
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {SERVICES.map(({ Icon, title, desc }, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="group">
                  {/* Contenedor del Icono usando brand-800 y bordes brand-300 */}
                  <div className="mb-6 w-14 h-14 rounded-sm border border-brand-300/20 flex items-center justify-center bg-brand-800/50 group-hover:bg-brand-500 group-hover:border-brand-400 transition-all duration-500 ease-out">
                    <Icon className="w-6 h-6 text-brand-200 group-hover:text-white transition-colors" />
                  </div>
                  
                  <h3 className="text-white font-display font-bold text-[19px] mb-3 tracking-wide">
                    {title}
                  </h3>
                  
                  <p className="text-brand-100/60 text-[13px] font-light leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>      
      {/* ── Contact ──*/}
      <section id="contacto" className="grid md:grid-cols-2">
        <div className="bg-brand-800 px-14 py-20 flex flex-col justify-center">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C9A96E] mb-3.5">
            <span className="inline-block w-6 h-px bg-[#C9A96E]" />
            Contáctanos
          </p>
          <h2 className="font-display text-[38px] font-bold text-white leading-[1.15] mb-3">
            Hablemos de<br />tu estadía
          </h2>
          <div className="w-14 h-px bg-[#C9A96E] mb-5" />
          <p className="text-white text-[15px] font-light leading-relaxed max-w-xs mb-11">
            Respondemos rápido. Reserva con confianza directamente con nosotros.
          </p>

          <div className="flex flex-col gap-6">
            {CONTACTS.map(({ Icon, label, value }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#C9A96E]/40 flex items-center justify-center flex-shrink-0 bg-brand-700/50">
                  <Icon className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#C9A96E] mb-0.5">{label}</p>
                  <p className="text-white text-[14px] font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-14 py-20 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h3 className="font-display text-[24px] font-bold text-brand-900 mb-1.5">
              Verificar disponibilidad
            </h3>
            <p className="text-[13px] text-gray-400 mb-8">Completa los datos y te contactamos en minutos</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Llegada", type: "date" },
                { label: "Salida",  type: "date" },
              ].map(({ label, type }) => (
                <div key={label}>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    className="w-full border border-brand-100 rounded-sm px-3.5 py-3 text-[13px] text-brand-900 outline-none focus:border-brand-400 transition-colors"
                  />
                </div>
              ))}
            </div>

            {[
              { label: "Habitación", isSelect: true },
              { label: "Tu nombre",  type: "text",  placeholder: "Nombre completo" },
              { label: "WhatsApp / Teléfono", type: "tel", placeholder: "+51 9xx xxx xxx" },
            ].map(({ label, isSelect, type, placeholder }) => (
              <div key={label} className="mb-4">
                <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-1.5">
                  {label}
                </label>
                {isSelect ? (
                  <select className="w-full border border-brand-100 rounded-sm px-3.5 py-3 text-[13px] text-brand-900 outline-none focus:border-brand-400 transition-colors bg-white appearance-none cursor-pointer">
                    <option>Estándar — S/. 60 / noche</option>
                    <option>Suite Deluxe — S/. 120 / noche</option>
                    <option>Familiar — S/. 180 / noche</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full border border-brand-100 rounded-sm px-3.5 py-3 text-[13px] text-brand-900 outline-none focus:border-brand-400 transition-colors placeholder:text-gray-300"
                  />
                )}
              </div>
            ))}

            <button
              onClick={onLogin}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-[15px] rounded-sm text-[12px] tracking-[0.14em] uppercase transition-all duration-200 hover:-translate-y-px mt-2"
            >
              Consultar disponibilidad
            </button>
            <p className="text-[11px] text-gray-300 text-center mt-3 leading-relaxed">
              Sin cargos al consultar · Confirmación en menos de 2 horas
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──*/}
      <footer className="bg-brand-900 border-t border-[#C9A96E]/15 py-10 px-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border border-[#C9A96E]/40 flex items-center justify-center">
            <img src="/DVita_Logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display text-[14px] font-semibold text-white">Hospedaje D'Vita</span>
        </div>
        <p className="text-white text-[11px] tracking-[0.06em]">
          © 2026 · Chiclayo, Perú · Todos los derechos reservados
        </p>
      </footer>
      {/* ── Modal de Reserva ── */}
      <ReservaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onLogin={onLogin}
        initialRoom={modalRoom}
      />
      {/* ── ChatBot flotante ── */}
      <ChatBot />
    </div>
  );
}
