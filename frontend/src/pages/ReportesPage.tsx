import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, DollarSign, BedDouble,
  Calendar, RefreshCw, AlertCircle, ArrowUp, ArrowDown, Minus,
  CalendarCheck, Users, CreditCard,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MesData    { mes: string; anio: number; total: number; pagos: number }
interface MetodoData { metodo: string; total: number; cantidad: number }
interface OcupData   { tipo: string; disponibles: number; ocupadas: number; mantenimiento: number; total: number }
interface EstadoMap  { [key: string]: number }

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_MESES: MesData[] = [
  { mes: "Nov", anio: 2025, total: 3200,  pagos: 18 },
  { mes: "Dic", anio: 2025, total: 4800,  pagos: 26 },
  { mes: "Ene", anio: 2026, total: 4100,  pagos: 22 },
  { mes: "Feb", anio: 2026, total: 5300,  pagos: 30 },
  { mes: "Mar", anio: 2026, total: 4700,  pagos: 27 },
  { mes: "Abr", anio: 2026, total: 6200,  pagos: 35 },
];
const DEMO_METODOS: MetodoData[] = [
  { metodo: "YAPE",           total: 12400, cantidad: 42 },
  { metodo: "EFECTIVO",       total: 8200,  cantidad: 28 },
  { metodo: "TRANSFERENCIA",  total: 6100,  cantidad: 15 },
  { metodo: "TARJETA_DEBITO", total: 3800,  cantidad: 12 },
  { metodo: "PLIN",           total: 2100,  cantidad: 8  },
];
const DEMO_OCUP: OcupData[] = [
  { tipo: "Estándar", disponibles: 6, ocupadas: 8,  mantenimiento: 1, total: 15 },
  { tipo: "Suite",    disponibles: 3, ocupadas: 4,  mantenimiento: 1, total: 8  },
  { tipo: "Familiar", disponibles: 2, ocupadas: 3,  mantenimiento: 0, total: 5  },
];
const DEMO_ESTADOS: EstadoMap = {
  PENDIENTE: 8, CONFIRMADA: 14, CANCELADA: 3, COMPLETADA: 22,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `S/.${n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDecimal(n: number) {
  return `S/.${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useData<T>(url: string, fallback: T): [T, boolean, boolean] {
  const [data, setData]     = useState<T>(fallback);
  const [loading, setLoad]  = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setLoad(true);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d  => { setData(d); setIsDemo(false); })
      .catch(() => { setData(fallback); setIsDemo(true); })
      .finally(() => setLoad(false));
  }, [url]);

  return [data, loading, isDemo];
}

// ─── Gráfico de barras — Ingresos mensuales ───────────────────────────────────
function BarChart({ data }: { data: MesData[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.total), 1);
  const W = 520, H = 200, PL = 56, PB = 36, PT = 16, PR = 16;
  const cW = W - PL - PR, cH = H - PB - PT;
  const bW = Math.floor(cW / data.length) - 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PT + cH - f * cH;
        return (
          <g key={f}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#EDEBE8" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9A948D">
              {(max * f) >= 1000 ? `${((max * f) / 1000).toFixed(0)}k` : (max * f).toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x    = PL + (cW / data.length) * i + (cW / data.length - bW) / 2;
        const bH   = Math.max((d.total / max) * cH, 2);
        const y    = PT + cH - bH;
        const last = i === data.length - 1;
        return (
          <g key={i}>
            {/* Bar background */}
            <rect x={x} y={PT} width={bW} height={cH} rx="4" fill="#FBF3EE" />
            {/* Bar fill */}
            <rect x={x} y={y} width={bW} height={bH} rx="4" fill={last ? "#B8622A" : "#D99B6E"} />
            {/* Value label */}
            {bH > 18 && (
              <text x={x + bW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill={last ? "#7A3D14" : "#9A5020"} fontWeight="600">
                {d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : d.total}
              </text>
            )}
            {/* Month label */}
            <text x={x + bW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill={last ? "#3D1F0A" : "#5C5751"} fontWeight={last ? "700" : "400"}>
              {d.mes}
            </text>
          </g>
        );
      })}

      {/* Axis */}
      <line x1={PL} y1={PT + cH} x2={W - PR} y2={PT + cH} stroke="#EDEBE8" strokeWidth="1" />
    </svg>
  );
}

// ─── Componentes de UI ────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-100 rounded ${className}`} />;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-[18px] font-bold text-brand-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-[12px] text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  label, value, sub, delta, icon: Icon,
}: {
  label: string; value: string | number; sub: string;
  delta?: number; icon: any;
}) {
  const DeltaIcon = delta === undefined ? null : delta > 0 ? ArrowUp : delta < 0 ? ArrowDown : Minus;
  // Mantenemos el color semántico para el delta (verde/rojo) por legibilidad
  const deltaColor = delta === undefined ? "" : delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-neutral-400";

  return (
    <div className="rounded-sm border border-neutral-200 p-5 shadow-sm flex flex-col gap-3 bg-white">
      <div className="flex items-center justify-between">
        {/* Usamos el color #D99B6E (brand-300 aproximado) en el fondo del icono */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FBF3EE]">
          <Icon className="w-4 h-4 text-[#B8622A]" /> 
        </div>
        {DeltaIcon && delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${deltaColor}`}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-[28px] font-bold leading-none mb-1 text-neutral-900">{value}</p>
        {/* Aplicamos el color solicitado al label para dar identidad */}
        <p className="text-[12px] font-semibold text-[#D99B6E]">{label}</p>
        <p className="text-[11px] mt-0.5 text-neutral-400">{sub}</p>
      </div>
    </div>
  );
}

// ─── Barra de progreso para métodos de pago ───────────────────────────────────
function MetodoRow({ metodo, total, cantidad, totalGlobal, index }: {
  metodo: string; total: number; cantidad: number; totalGlobal: number; index: number;
}) {
  const pct = totalGlobal > 0 ? (total / totalGlobal) * 100 : 0;
  const FILLS = ["#B8622A", "#C97B45", "#D99B6E", "#E8BFAA", "#F4DDD0"];
  const TEXTS = ["text-brand-800", "text-brand-700", "text-brand-600", "text-brand-500", "text-brand-400"];
  const label = metodo.replace(/_/g, " ");

  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-50 last:border-0">
      <div className="w-28 flex-shrink-0">
        <span className={`text-[12px] font-semibold ${TEXTS[index] ?? "text-neutral-600"}`}>{label}</span>
      </div>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: FILLS[index] ?? "#B8622A" }}
        />
      </div>
      <div className="w-20 text-right flex-shrink-0">
        <span className="text-[12px] font-bold text-neutral-800">{fmtDecimal(total)}</span>
      </div>
      <div className="w-14 text-right flex-shrink-0">
        <span className="text-[11px] text-neutral-400">{cantidad} txn</span>
      </div>
      <div className="w-12 text-right flex-shrink-0">
        <span className="text-[11px] font-semibold text-brand-600">{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ─── Card de ocupación por tipo ───────────────────────────────────────────────
function OcupacionCard({ data }: { data: OcupData }) {
  const pctOcupada = data.total > 0 ? (data.ocupadas / data.total) * 100 : 0;
  const pctLibre   = data.total > 0 ? (data.disponibles / data.total) * 100 : 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-neutral-800 text-[14px]">{data.tipo}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{data.total} habitaciones en total</p>
        </div>
        <div className="text-right">
          <p className="font-display text-[22px] font-bold text-brand-600 leading-none">{pctOcupada.toFixed(0)}%</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">ocupación</p>
        </div>
      </div>

      {/* Barra segmentada */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-4">
        {data.ocupadas > 0 && (
          <div className="rounded-full bg-brand-500" style={{ width: `${(data.ocupadas / data.total) * 100}%` }} />
        )}
        {data.disponibles > 0 && (
          <div className="rounded-full bg-brand-100" style={{ width: `${(data.disponibles / data.total) * 100}%` }} />
        )}
        {data.mantenimiento > 0 && (
          <div className="rounded-full bg-yellow-300" style={{ width: `${(data.mantenimiento / data.total) * 100}%` }} />
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-[11px]">
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          {data.ocupadas} ocupadas
        </span>
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-brand-100 border border-brand-200 inline-block" />
          {data.disponibles} libres
        </span>
        {data.mantenimiento > 0 && (
          <span className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
            {data.mantenimiento} mant.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Tabla de reservas por estado ─────────────────────────────────────────────
function EstadoRow({ estado, count, total }: { estado: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const STYLES: Record<string, { dot: string; text: string; bg: string }> = {
    CONFIRMADA: { dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50 border-green-100" },
    COMPLETADA: { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50 border-blue-100" },
    PENDIENTE:  { dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-100" },
    CANCELADA:  { dot: "bg-red-400",    text: "text-red-700",    bg: "bg-red-50 border-red-100" },
  };
  const s = STYLES[estado] ?? { dot: "bg-neutral-400", text: "text-neutral-600", bg: "bg-neutral-50 border-neutral-100" };

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${s.bg}`}>
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full ${s.dot} flex-shrink-0`} />
        <span className={`text-[13px] font-semibold ${s.text}`}>{estado}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[13px] font-bold w-6 text-right ${s.text}`}>{count}</span>
        <span className="text-[11px] text-neutral-400 w-10 text-right">{pct.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [meses,   loadM,  demoM]  = useData<MesData[]>("/api/dashboard/ingresos-mensuales", DEMO_MESES);
  const [metodos, loadMt, demoMt] = useData<MetodoData[]>("/api/dashboard/metodos-pago", DEMO_METODOS);
  const [ocup,    loadO,  demoO]  = useData<OcupData[]>("/api/dashboard/ocupacion-por-tipo", DEMO_OCUP);
  const [estados, loadE,  demoE]  = useData<EstadoMap>("/api/dashboard/reservas-por-estado", DEMO_ESTADOS);

  const loading = loadM || loadMt || loadO || loadE;
  const isDemo  = demoM || demoMt || demoO || demoE;

  // Cálculos
  const totalIngresos = meses.reduce((s, m) => s + m.total, 0);
  const totalPagos    = meses.reduce((s, m) => s + m.pagos, 0);
  const mesActual     = meses[meses.length - 1];
  const mesPrevio     = meses[meses.length - 2];
  const delta = mesPrevio?.total > 0
    ? ((mesActual?.total ?? 0) - mesPrevio.total) / mesPrevio.total * 100
    : 0;

  const totalMetodos  = metodos.reduce((s, m) => s + m.total, 0);
  const totalHab      = ocup.reduce((s, o) => s + o.total, 0);
  const habOcupadas   = ocup.reduce((s, o) => s + o.ocupadas, 0);
  const pctOcupacion  = totalHab > 0 ? (habOcupadas / totalHab) * 100 : 0;

  const totalReservas = Object.values(estados).reduce((s, v) => s + v, 0);
  const estadosArr    = ["CONFIRMADA", "COMPLETADA", "PENDIENTE", "CANCELADA"].map(k => ({
    estado: k, count: estados[k] ?? 0,
  }));

  const today = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-neutral-900 leading-tight flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-brand-500" />
            Reportes
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1 font-light">
            Indicadores clave del negocio — Hospedaje D'Vita
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="flex items-center gap-1.5 text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3 h-3" /> Datos de ejemplo
            </span>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-sm text-[12px] text-neutral-500 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            {today}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-[12px] font-semibold rounded-sm transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      {loading
        ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-36 rounded-sm"/>)}</div>
        : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Ingresos del mes"
              value={fmt(mesActual?.total ?? 0)}
              sub={`${mesActual?.pagos ?? 0} pagos registrados`}
              delta={delta}
              icon={DollarSign}
            />
            <KPICard
              label="Ingresos acumulados"
              value={fmt(totalIngresos)}
              sub={`${totalPagos} pagos en 6 meses`}
              icon={TrendingUp}
            />
            <KPICard
              label="Ocupación actual"
              value={`${pctOcupacion.toFixed(0)}%`}
              sub={`${habOcupadas} de ${totalHab} habitaciones`}
              icon={BedDouble}
            />
            <KPICard
              label="Total reservas"
              value={totalReservas}
              sub={`${estados["CONFIRMADA"] ?? 0} confirmadas activas`}
              icon={CalendarCheck}
            />
          </div>
        )
      }

      {/* ── Fila principal: Ingresos + Reservas por estado ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráfico de barras — ocupa 2/3 */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div>
              <h3 className="font-semibold text-neutral-800 text-[14px]">Ingresos mensuales</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Últimos 6 meses</p>
            </div>
            {!loading && (
              <div className="text-right">
                <p className="font-display text-[20px] font-bold text-brand-600 leading-none">{fmt(totalIngresos)}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">total período</p>
              </div>
            )}
          </div>
          <div className="p-6">
            {loading
              ? <Skeleton className="h-48 w-full rounded" />
              : <BarChart data={meses} />
            }
          </div>
          {!loading && (
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Promedio mensual</span>
              <span className="text-[13px] font-bold text-neutral-700">{fmt(totalIngresos / (meses.length || 1))}</span>
            </div>
          )}
        </div>

        {/* Reservas por estado — 1/3 */}
        <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-neutral-800 text-[14px]">Reservas por estado</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">{totalReservas} reservas en total</p>
          </div>
          <div className="p-5 flex flex-col gap-2">
            {loading
              ? Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-12 rounded-lg"/>)
              : estadosArr.map(({ estado, count }) => (
                <EstadoRow key={estado} estado={estado} count={count} total={totalReservas} />
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Métodos de pago ── */}
      <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="font-semibold text-neutral-800 text-[14px]">Métodos de pago</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Distribución de ingresos por canal</p>
          </div>
          {!loading && (
            <div className="text-right">
              <p className="font-display text-[18px] font-bold text-brand-600 leading-none">{fmtDecimal(totalMetodos)}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wide">ingreso total</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4">
          {loading
            ? Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-10 w-full rounded mb-2"/>)
            : metodos.map((m, i) => (
              <MetodoRow
                key={m.metodo}
                metodo={m.metodo}
                total={m.total}
                cantidad={m.cantidad}
                totalGlobal={totalMetodos}
                index={i}
              />
            ))
          }
        </div>
      </div>

      {/* ── Ocupación por tipo ── */}
      <div>
        <SectionHeader title="Ocupación por tipo de habitación" subtitle="Estado actual del inventario" />
        {loading
          ? <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-36 rounded-sm"/>)}</div>
          : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ocup.map((o) => <OcupacionCard key={o.tipo} data={o} />)}
            </div>
          )
        }
      </div>

    </div>
  );
}
