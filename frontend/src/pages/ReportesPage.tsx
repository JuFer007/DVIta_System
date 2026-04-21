import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, PieChart, DollarSign,
  Download, RefreshCw, Calendar, BedDouble,
  AlertCircle
} from "lucide-react";

interface MesData   { mes: string; anio: number; total: number; pagos: number }
interface EstadoData { estado: string; count: number }
interface MetodoData { metodo: string; total: number; cantidad: number }
interface OcupData   { tipo: string; disponibles: number; ocupadas: number; mantenimiento: number; total: number }

const C = {
  brand500:  "#B8622A",
  brand600:  "#9A5020",
  brand700:  "#7A3D14",
  brand300:  "#D99B6E",
  brand100:  "#F4DDD0",
  brand50:   "#FBF3EE",
  brand900:  "#3D1F0A",
  success:   "#2D7A4F",
  warning:   "#B08620",
  danger:    "#A33030",
  info:      "#2A5F8B",
  neutral200:"#D8D4CF",
  neutral400:"#9A948D",
  neutral700:"#44403A",
  neutral800:"#2E2B27",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE:  C.warning,
  CONFIRMADA: C.success,
  CANCELADA:  C.danger,
  COMPLETADA: C.info,
};

const METODO_COLORS = [C.brand500, C.brand300, C.info, C.success, C.warning, C.danger];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `S/.${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useReporteData<T>(url: string, fallback: T): [T, boolean, string | null] {
  const [data, setData]       = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setError(null); })
      .catch(() => setError("Sin conexión al servidor — mostrando datos de ejemplo"))
      .finally(() => setLoading(false));
  }, [url]);

  return [data, loading, error];
}

// ─── Gráfico de barras — Ingresos mensuales ───────────────────────────────────
function BarrasMensuales({ data }: { data: MesData[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const W = 520, H = 220, PAD_L = 60, PAD_B = 40, PAD_T = 16, PAD_R = 16;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const barW = Math.floor(chartW / data.length) - 10;

  const yLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ pct: f, val: maxVal * f }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Grid lines */}
      {yLines.map(({ pct, val }) => {
        const y = PAD_T + chartH - pct * chartH;
        return (
          <g key={pct}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={C.neutral200} strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize="9" fill={C.neutral400}>
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD_L + (chartW / data.length) * i + (chartW / data.length - barW) / 2;
        const barH = (d.total / maxVal) * chartH;
        const y = PAD_T + chartH - barH;
        const isLast = i === data.length - 1;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx="4"
              fill={isLast ? C.brand500 : C.brand300}
            />
            {barH > 20 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="9" fill={C.brand600} fontWeight="600">
                {d.total >= 1000 ? `${(d.total / 1000).toFixed(1)}k` : d.total.toFixed(0)}
              </text>
            )}
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill={C.neutral700} fontWeight={isLast ? "700" : "400"}>
              {d.mes}
            </text>
          </g>
        );
      })}

      {/* Axis */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke={C.neutral200} strokeWidth="1" />
      <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke={C.neutral200} strokeWidth="1" />
    </svg>
  );
}

// ─── Donut — Estados de reservas ─────────────────────────────────────────────
function Donut({ data }: { data: EstadoData[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 70, CX = 90, CY = 90, stroke = 28;
  const circum = 2 * Math.PI * R;
  let offset = 0;

  const slices = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circum;
    const slice = { ...d, pct, dash, offset };
    offset += dash;
    return slice;
  });

  return (
    <svg viewBox="0 0 260 180" className="w-full" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Donut */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.brand50} strokeWidth={stroke} />
      {slices.map((s, i) => (
        <circle
          key={i} cx={CX} cy={CY} r={R} fill="none"
          stroke={ESTADO_COLORS[s.estado] ?? C.neutral400}
          strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${circum - s.dash}`}
          strokeDashoffset={circum / 4 - s.offset}
          strokeLinecap="butt"
        />
      ))}
      {/* Centro */}
      <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="20" fontWeight="700" fill={C.neutral800}>{total}</text>
      <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9"  fill={C.neutral400}>reservas</text>

      {/* Leyenda */}
      {slices.map((s, i) => (
        <g key={i} transform={`translate(185, ${20 + i * 34})`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill={ESTADO_COLORS[s.estado] ?? C.neutral400} />
          <text x="16" y="9" fontSize="11" fill={C.neutral700} fontWeight="600">{s.estado}</text>
          <text x="16" y="22" fontSize="9" fill={C.neutral400}>{s.count} ({(s.pct * 100).toFixed(0)}%)</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Barras horizontales — Métodos de pago ────────────────────────────────────
function BarrasHorizontales({ data }: { data: MetodoData[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const rowH = 36, PAD_L = 100, PAD_R = 70, BAR_H = 14;
  const W = 500, H = data.length * rowH + 16;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {data.map((d, i) => {
        const y = 8 + i * rowH;
        const barW = ((W - PAD_L - PAD_R) * d.total) / maxVal;
        const color = METODO_COLORS[i % METODO_COLORS.length];
        return (
          <g key={i}>
            <text x={PAD_L - 8} y={y + BAR_H / 2 + 4} textAnchor="end" fontSize="11" fill={C.neutral700} fontWeight="500">
              {d.metodo.replace("_", " ")}
            </text>
            <rect x={PAD_L} y={y} width={W - PAD_L - PAD_R} height={BAR_H} rx="4" fill={C.brand50} />
            <rect x={PAD_L} y={y} width={barW} height={BAR_H} rx="4" fill={color} />
            <text x={PAD_L + barW + 6} y={y + BAR_H / 2 + 4} fontSize="10" fill={C.neutral700} fontWeight="600">
              {fmt(d.total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Barras agrupadas — Ocupación por tipo ────────────────────────────────────
function BarrasAgrupadas({ data }: { data: OcupData[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const W = 500, H = 200, PAD_L = 16, PAD_B = 40, PAD_T = 20, PAD_R = 100;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const groupW = chartW / data.length;
  const barW = 14, gap = 4;
  const KEYS = ["disponibles","ocupadas","mantenimiento"] as const;
  const COLORS = [C.success, C.danger, C.warning];
  const LABELS = ["Disponibles","Ocupadas","Mantenimiento"];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: "DM Sans, system-ui, sans-serif" }}>
      {/* Grid */}
      {[0, 0.5, 1].map((f) => {
        const y = PAD_T + chartH - f * chartH;
        return (
          <g key={f}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke={C.neutral200} strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD_L - 2} y={y + 4} textAnchor="start" fontSize="9" fill={C.neutral400}>{Math.round(maxVal * f)}</text>
          </g>
        );
      })}

      {data.map((d, gi) => {
        const groupX = PAD_L + groupW * gi + (groupW - (barW + gap) * 3) / 2;
        return (
          <g key={gi}>
            {KEYS.map((k, ki) => {
              const val = d[k] as number;
              const bh = (val / maxVal) * chartH;
              const x = groupX + ki * (barW + gap);
              const y = PAD_T + chartH - bh;
              return (
                <g key={ki}>
                  <rect x={x} y={y} width={barW} height={bh} rx="3" fill={COLORS[ki]} opacity="0.85" />
                  {bh > 14 && (
                    <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill={COLORS[ki]} fontWeight="700">{val}</text>
                  )}
                </g>
              );
            })}
            <text x={groupX + ((barW + gap) * 3) / 2} y={H - 8} textAnchor="middle" fontSize="10" fill={C.neutral700} fontWeight="600">
              {d.tipo.length > 10 ? d.tipo.slice(0, 9) + "…" : d.tipo}
            </text>
          </g>
        );
      })}

      {/* Eje */}
      <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke={C.neutral200} strokeWidth="1" />

      {/* Leyenda */}
      {LABELS.map((lbl, i) => (
        <g key={i} transform={`translate(${W - PAD_R + 8}, ${PAD_T + i * 22})`}>
          <rect x="0" y="0" width="10" height="10" rx="2" fill={COLORS[i]} />
          <text x="14" y="9" fontSize="10" fill={C.neutral700}>{lbl}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Tarjeta de gráfico ───────────────────────────────────────────────────────
function ChartCard({
  title, subtitle, icon: Icon, children, loading, error,
}: {
  title: string; subtitle?: string; icon: any;
  children: React.ReactNode; loading?: boolean; error?: string | null;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100">
        <Icon className="w-4 h-4 text-brand-500" />
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-800 text-[14px]">{title}</h3>
          {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color = "brand" }: { label: string; value: string | number; sub: string; color?: string }) {
  const colors: Record<string, string> = {
    brand:  "border-t-brand-500  bg-brand-50  text-brand-600",
    green:  "border-t-green-500  bg-green-50  text-green-600",
    blue:   "border-t-blue-500   bg-blue-50   text-blue-600",
    yellow: "border-t-yellow-500 bg-yellow-50 text-yellow-600",
    red:    "border-t-red-500    bg-red-50    text-red-600",
  };
  const cls = colors[color] ?? colors.brand;
  return (
    <div className={`bg-white border border-neutral-200 border-t-2 ${cls.split(" ")[0]} rounded-sm p-4 shadow-sm`}>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-neutral-400 mb-2">{label}</p>
      <p className={`font-display text-[26px] font-bold ${cls.split(" ")[2]} leading-none mb-1`}>{value}</p>
      <p className="text-[11px] text-neutral-400">{sub}</p>
    </div>
  );
}

// ─── Tabla resumen ────────────────────────────────────────────────────────────
function ResumenTabla({ data }: { data: MetodoData[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-neutral-100">
          <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Método</th>
          <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Transacciones</th>
          <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Total</th>
          <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">% del ingreso</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i} className="border-b border-neutral-50 hover:bg-brand-50 transition-colors">
            <td className="py-2 px-3 text-neutral-700 font-medium">{d.metodo.replace("_", " ")}</td>
            <td className="py-2 px-3 text-right text-neutral-500">{d.cantidad}</td>
            <td className="py-2 px-3 text-right font-semibold text-neutral-800">{fmt(d.total)}</td>
            <td className="py-2 px-3 text-right">
              <span className="inline-block bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {total > 0 ? ((d.total / total) * 100).toFixed(1) : 0}%
              </span>
            </td>
          </tr>
        ))}
        <tr className="bg-neutral-50 font-bold">
          <td className="py-2 px-3 text-neutral-700">Total</td>
          <td className="py-2 px-3 text-right text-neutral-500">{data.reduce((s, d) => s + d.cantidad, 0)}</td>
          <td className="py-2 px-3 text-right text-brand-700">{fmt(total)}</td>
          <td className="py-2 px-3 text-right text-neutral-400 text-[10px]">100%</td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Datos demo (se muestran si la API no está disponible) ───────────────────
const DEMO_MESES: MesData[] = [
  { mes: "Nov", anio: 2025, total: 3200, pagos: 18 },
  { mes: "Dic", anio: 2025, total: 4800, pagos: 26 },
  { mes: "Ene", anio: 2026, total: 4100, pagos: 22 },
  { mes: "Feb", anio: 2026, total: 5300, pagos: 30 },
  { mes: "Mar", anio: 2026, total: 4700, pagos: 27 },
  { mes: "Abr", anio: 2026, total: 6200, pagos: 35 },
];
const DEMO_ESTADOS: EstadoData[] = [
  { estado: "PENDIENTE",  count: 8 },
  { estado: "CONFIRMADA", count: 14 },
  { estado: "CANCELADA",  count: 3 },
  { estado: "COMPLETADA", count: 22 },
];
const DEMO_METODOS: MetodoData[] = [
  { metodo: "YAPE",           total: 12400, cantidad: 42 },
  { metodo: "EFECTIVO",       total: 8200,  cantidad: 28 },
  { metodo: "TRANSFERENCIA",  total: 6100,  cantidad: 15 },
  { metodo: "TARJETA_DEBITO", total: 3800,  cantidad: 12 },
  { metodo: "PLIN",           total: 2100,  cantidad: 8 },
];
const DEMO_OCUP: OcupData[] = [
  { tipo: "Estándar",  disponibles: 6, ocupadas: 8, mantenimiento: 1, total: 15 },
  { tipo: "Suite",     disponibles: 3, ocupadas: 4, mantenimiento: 1, total: 8 },
  { tipo: "Familiar",  disponibles: 2, ocupadas: 3, mantenimiento: 0, total: 5 },
];

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [meses,   loadingM, errorM] = useReporteData<MesData[]>  ("/api/dashboard/ingresos-mensuales", DEMO_MESES);
  const [estados, loadingE, errorE] = useReporteData<Record<string, number>>("/api/dashboard/reservas-por-estado", {});
  const [metodos, loadingMt, errorMt] = useReporteData<MetodoData[]>("/api/dashboard/metodos-pago", DEMO_METODOS);
  const [ocup,    loadingO, errorO]   = useReporteData<OcupData[]>  ("/api/dashboard/ocupacion-por-tipo", DEMO_OCUP);

  // Normalizar estados a array
  const estadosArr: EstadoData[] = Object.entries(
    Object.keys(estados).length ? estados : Object.fromEntries(DEMO_ESTADOS.map((d) => [d.estado, d.count]))
  ).map(([estado, count]) => ({ estado, count: count as number }));

  const totalIngresos = meses.reduce((s, m) => s + m.total, 0);
  const totalPagos    = meses.reduce((s, m) => s + m.pagos, 0);
  const mesActual     = meses[meses.length - 1];
  const mesPrevio     = meses[meses.length - 2];
  const pctCambio     = mesPrevio?.total > 0
    ? (((mesActual?.total ?? 0) - mesPrevio.total) / mesPrevio.total) * 100
    : 0;

  const habTotal      = ocup.reduce((s, o) => s + o.total, 0);
  const habOcupadas   = ocup.reduce((s, o) => s + o.ocupadas, 0);
  const pctOcupacion  = habTotal > 0 ? ((habOcupadas / habTotal) * 100).toFixed(1) : "—";

  const today = new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold text-neutral-900 leading-tight flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-brand-500" />
            Reportes y Análisis
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1 font-light">
            Métricas clave del negocio — Hospedaje D'Vita
          </p>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Ingresos últimos 6 meses"
          value={fmt(totalIngresos)}
          sub={`${totalPagos} pagos procesados`}
          color="brand"
        />
        <KPICard
          label="Mes actual"
          value={fmt(mesActual?.total ?? 0)}
          sub={`${pctCambio >= 0 ? "+" : ""}${pctCambio.toFixed(1)}% vs mes anterior`}
          color={pctCambio >= 0 ? "green" : "red"}
        />
        <KPICard
          label="Ocupación actual"
          value={`${pctOcupacion}%`}
          sub={`${habOcupadas} de ${habTotal} habitaciones`}
          color="blue"
        />
        <KPICard
          label="Reservas totales"
          value={estadosArr.reduce((s, e) => s + e.count, 0)}
          sub={`${estadosArr.find((e) => e.estado === "CONFIRMADA")?.count ?? 0} confirmadas`}
          color="yellow"
        />
      </div>

      {/* ── Fila 1: Ingresos mensuales + Donut estados ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard
            title="Ingresos mensuales"
            subtitle="Últimos 6 meses"
            icon={TrendingUp}
            loading={loadingM}
            error={errorM}
          >
            <BarrasMensuales data={meses} />
            <div className="flex justify-end gap-6 mt-3 pt-3 border-t border-neutral-100">
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Total período</p>
                <p className="font-display text-[18px] font-bold text-brand-600">{fmt(totalIngresos)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Promedio mensual</p>
                <p className="font-display text-[18px] font-bold text-neutral-700">{fmt(totalIngresos / (meses.length || 1))}</p>
              </div>
            </div>
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Reservas por estado"
            subtitle="Distribución actual"
            icon={PieChart}
            loading={loadingE}
            error={errorE}
          >
            <Donut data={estadosArr} />
          </ChartCard>
        </div>
      </div>

      {/* ── Fila 2: Métodos de pago ── */}
      <ChartCard
        title="Métodos de pago"
        subtitle="Distribución de ingresos por método"
        icon={DollarSign}
        loading={loadingMt}
        error={errorMt}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarrasHorizontales data={metodos} />
          <ResumenTabla data={metodos} />
        </div>
      </ChartCard>

      {/* ── Fila 3: Ocupación por tipo ── */}
      <ChartCard
        title="Ocupación por tipo de habitación"
        subtitle="Estado actual del inventario"
        icon={BedDouble}
        loading={loadingO}
        error={errorO}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <BarrasAgrupadas data={ocup} />
          </div>
          <div className="flex flex-col gap-3">
            {ocup.map((o, i) => {
              const pct = o.total > 0 ? ((o.ocupadas / o.total) * 100).toFixed(0) : "0";
              return (
                <div key={i} className="border border-neutral-100 rounded-sm p-3 hover:bg-brand-50 transition-colors">
                  <p className="text-[12px] font-bold text-neutral-700 mb-2">{o.tipo}</p>
                  <div className="flex gap-3 text-[11px]">
                    <span className="text-green-600">✓ {o.disponibles} libres</span>
                    <span className="text-red-600">● {o.ocupadas} ocupadas</span>
                    {o.mantenimiento > 0 && <span className="text-yellow-600">⚙ {o.mantenimiento} mant.</span>}
                  </div>
                  <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">{pct}% ocupación</p>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>

    </div>
  );
}
