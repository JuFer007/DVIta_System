import { useState, useEffect } from "react";
import { MessageSquare, Send, Eye, CheckCircle, Clock, User } from "lucide-react";
import DataTable from "../../components/DataTable";
import EntityModal, { type ModalField } from "../../components/EntityModal";
import { consultasService } from "../../services/api";
import { useToast } from "../../components/Toast";

type Filtro = "todas" | "pendientes" | "respondidas";

interface ConsultaRow {
  id: number;
  nombre: string;
  email: string;
  mensaje: string;
  fecha: string;
  respondido: boolean;
  respuesta: string | null;
  empleadoResponde: { idEmpleado: number; nombre: string; apellidoP: string; apellidoM: string } | null;
  _raw: any;
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todas",      label: "Todas" },
  { key: "pendientes", label: "Pendientes" },
  { key: "respondidas",label: "Respondidas" },
];

const FIELDS_RESPONDER: ModalField[] = [
  { key: "nombre",   label: "Nombre",  type: "readonly" },
  { key: "email",    label: "Email",   type: "readonly" },
  { key: "mensaje",  label: "Mensaje", type: "readonly" },
  { key: "respuestaComp", label: "Tu respuesta", type: "textarea", required: true,
    placeholder: "Escribe aquí la respuesta para el cliente…", maxLength: 500 },
];

const FIELDS_VER: ModalField[] = [
  { key: "nombre",   label: "Nombre",  type: "readonly" },
  { key: "email",    label: "Email",   type: "readonly" },
  { key: "mensaje",  label: "Mensaje", type: "readonly" },
  { key: "respondio", label: "Respondió", type: "readonly" },
  { key: "respuestaComp", label: "Respuesta enviada", type: "readonly" },
  { key: "fechaResp", label: "Fecha de respuesta", type: "readonly" },
];

export default function ConsultasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("pendientes");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ConsultaRow | null>(null);
  const [modoVer, setModoVer] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await consultasService.getAll();
      setData(res);
    } catch (e: any) {
      setError(e.message || "Error al cargar consultas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const mapear = (items: any[]): ConsultaRow[] =>
    items.map((c: any) => ({
      id: c.idConsulta,
      nombre: c.nombre,
      email: c.email,
      mensaje: c.mensaje,
      fecha: c.fecha,
      respondido: c.respondido,
      respuesta: c.respuesta,
      empleadoResponde: c.empleadoResponde ?? null,
      _raw: c,
    }));

  const filtradas = (() => {
    const m = mapear(data);
    if (filtro === "pendientes") return m.filter((r) => !r.respondido);
    if (filtro === "respondidas") return m.filter((r) => r.respondido);
    return m;
  })();

  const handleResponder = (row: ConsultaRow) => {
    setSelected(row);
    setModoVer(false);
    setModalOpen(true);
  };

  const handleVer = (row: ConsultaRow) => {
    setSelected(row);
    setModoVer(true);
    setModalOpen(true);
  };

  const handleEnviarRespuesta = async (form: any) => {
    if (!selected) return;
    const reply = form.respuestaComp?.trim();
    if (!reply) {
      toast.showToast("fail", "Validación", "Debe escribir una respuesta");
      return;
    }
    setSending(true);
    try {
      await consultasService.responder(selected.id, reply);
      toast.showToast("success", "Respuesta enviada",
        selected.email
          ? `Se notificó a ${selected.email}`
          : "Respuesta registrada (sin email)");
      setModalOpen(false);
      setSelected(null);
      cargar();
    } catch (e: any) {
      toast.showToast("fail", "Error", e.message || "No se pudo enviar la respuesta");
    } finally {
      setSending(false);
    }
  };

  const nombreEmpleado = (e: ConsultaRow["empleadoResponde"]) =>
    e ? `${e.nombre} ${e.apellidoP} ${e.apellidoM}` : "—";

  const formDataVer = selected
    ? {
        nombre: selected.nombre?.toUpperCase(),
        email: selected.email,
        mensaje: selected.mensaje?.toUpperCase(),
        respondio: nombreEmpleado(selected.empleadoResponde)?.toUpperCase(),
        respuestaComp: selected.respuesta?.toUpperCase() ?? "—",
        fechaResp: selected._raw.fechaRespuesta
          ? new Date(selected._raw.fechaRespuesta).toLocaleString("es-PE")
          : "—",
      }
    : null;

  const formDataResponder = selected
    ? { nombre: selected.nombre?.toUpperCase(), email: selected.email, mensaje: selected.mensaje?.toUpperCase(), respuestaComp: "" }
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filtro === f.key
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        title="Consultas"
        data={filtradas}
        loading={loading}
        error={error}
        columns={[
          { key: "nombre", label: "Nombre", render: (v: string) => v?.toUpperCase() || "—" },
          { key: "email",  label: "Email" },
          {
            key: "mensaje", label: "Mensaje", sortable: false,
            render: (v: string) => {
              const s = v?.toUpperCase() || "—";
              return s.length > 60 ? `${s.slice(0, 60)}…` : s;
            },
          },
          {
            key: "fecha", label: "Fecha",
            render: (v: string) =>
              v ? new Date(v).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—",
          },
          {
            key: "respondido", label: "Estado",
            render: (v: boolean, row: ConsultaRow) => v
              ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Respondida</span>
              : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Pendiente</span>,
          },
          {
            key: "empleadoResponde", label: "Respondió por", sortable: false,
            render: (v: ConsultaRow["empleadoResponde"]) =>
              v ? <span className="inline-flex items-center gap-1 text-xs text-gray-600"><User className="w-3 h-3" />{nombreEmpleado(v).toUpperCase()}</span> : "—",
          },
          {
            key: "accion", label: "Acción", sortable: false,
            render: (_: any, row: ConsultaRow) => row.respondido
              ? (
                <button
                  onClick={() => handleVer(row)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
              )
              : (
                <button
                  onClick={() => handleResponder(row)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Responder
                </button>
              ),
          },
        ]}
      />

      {modoVer ? (
        <EntityModal
          open={modalOpen}
          title="Detalle de consulta"
          icon={<Eye className="w-4 h-4" />}
          fields={FIELDS_VER}
          data={formDataVer}
          loading={false}
          error={null}
          onClose={() => { setModalOpen(false); setSelected(null); }}
          onSave={() => {}}
        />
      ) : (
        <EntityModal
          open={modalOpen}
          title="Responder consulta"
          icon={<MessageSquare className="w-4 h-4" />}
          fields={FIELDS_RESPONDER}
          data={formDataResponder}
          loading={sending}
          error={null}
          onClose={() => { setModalOpen(false); setSelected(null); }}
          onSave={handleEnviarRespuesta}
        />
      )}
    </div>
  );
}
