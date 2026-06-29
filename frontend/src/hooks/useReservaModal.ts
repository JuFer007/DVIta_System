import { useState, useEffect } from "react";
import {
  ClienteData,
  buscarClienteEnBD,
  buscarEnReniec,
  buscarTiposHabitacion,
  buscarHabitacionDisponible,
  crearReservaConDni,
  buscarEmpleadoChatbot,
} from "../services/reservaWebService";

export type Step = 1 | 2 | 3;
export type DniStatus = "" | "bd" | "reniec" | "notfound";

export interface TipoHab {
  idTipoHabitacion: number;
  descripcion: string;
  precio: number;
}

export interface ReservaResult {
  idReserva: number;
  idPago?: number;
}

export function useReservaModal() {
  const today = new Date().toISOString().split("T")[0];
  const [tipos, setTipos] = useState<TipoHab[]>([]);
  const [tiposLoading, setTiposLoading] = useState(true);
  const [habitacion, setHabitacion] = useState<number | null>(null);
  const [llegada,    setLlegada]    = useState("");
  const [salida,     setSalida]     = useState("");
  const [dni,        setDni]        = useState("");
  const [nombre,     setNombre]     = useState("");
  const [apellidoP,  setApellidoP]  = useState("");
  const [apellidoM,  setApellidoM]  = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [email,      setEmail]      = useState("");
  const [adultos,    setAdultos]    = useState("1");
  const [notas,      setNotas]      = useState("");
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);
  const [dniStatus,   setDniStatus]   = useState<DniStatus>("");
  const [dniError,    setDniError]    = useState("");
  const [dniLoading,  setDniLoading]  = useState(false);
  const [step,      setStep]      = useState<Step>(1);
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [sendError, setSendError] = useState("");
  const [result,    setResult]    = useState<ReservaResult | null>(null);

  useEffect(() => {
    buscarTiposHabitacion().then((data) => {
      setTipos(data);
      if (data.length > 0 && habitacion === null) {
        setHabitacion(data[0].idTipoHabitacion);
      }
      setTiposLoading(false);
    });
  }, []);

  const selectedRoom = tipos.find((t) => t.idTipoHabitacion === habitacion) ?? tipos[0];

  const nights = (() => {
    if (!llegada || !salida) return 0;
    const diff = new Date(salida).getTime() - new Date(llegada).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  })();

  const total = selectedRoom ? nights * selectedRoom.precio : 0;

  const canGoStep2 = !!habitacion && !!llegada && !!salida && nights > 0;
  const canGoStep3 = !!nombre && !!apellidoP && !!telefono && !!dni;

  function resetDni() {
    setDniStatus("");
    setDniError("");
    setClienteData(null);
    setNombre(""); setApellidoP(""); setApellidoM("");
    setTelefono(""); setEmail("");
  }

  function reset() {
    setStep(1);
    if (tipos.length > 0) setHabitacion(tipos[0].idTipoHabitacion);
    setLlegada(""); setSalida("");
    setDni(""); setAdultos("1"); setNotas("");
    resetDni();
    setSent(false); setSendError(""); setResult(null);
  }

  async function buscarDni() {
    if (dni.length !== 8) {
      setDniError("El DNI debe tener exactamente 8 dígitos.");
      return;
    }
    setDniLoading(true);
    resetDni();

    const clienteBD = await buscarClienteEnBD(dni);
    if (clienteBD) {
      setClienteData(clienteBD);
      setNombre(clienteBD.nombre);
      setApellidoP(clienteBD.apellidoPaterno);
      setApellidoM(clienteBD.apellidoMaterno);
      setTelefono(clienteBD.telefono);
      setEmail(clienteBD.email);
      setDniStatus("bd");
      setDniLoading(false);
      return;
    }

    const reniec = await buscarEnReniec(dni);
    if (reniec) {
      setNombre(reniec.nombre ?? "");
      setApellidoP(reniec.apellidoPaterno ?? "");
      setApellidoM(reniec.apellidoMaterno ?? "");
      setDniStatus("reniec");
      setDniLoading(false);
      return;
    }
    setDniStatus("notfound");
    setDniError("No se encontró información. Ingresa tus datos manualmente.");
    setDniLoading(false);
  }

  async function confirmar() {
    if (!selectedRoom) return;
    setSending(true);
    setSendError("");

    try {
      const idHabitacion = await buscarHabitacionDisponible(selectedRoom.idTipoHabitacion, llegada, salida);
      if (!idHabitacion) {
        throw new Error(
          `No hay habitaciones de tipo "${selectedRoom.descripcion}" disponibles. Llámanos al +51 922 626 148.`
        );
      }

      const idEmpleado = await buscarEmpleadoChatbot();

      const payload: any = {
        idHabitacion,
        idEmpleado: idEmpleado ?? undefined,
        fechaReserva: today,
        fechaIngreso: llegada,
        fechaSalida: salida,
        estadoReserva: "PENDIENTE",
      };

      if (clienteData?.idCliente) {
        payload.idCliente = clienteData.idCliente;
      } else {
        if (!telefono) throw new Error("El teléfono es obligatorio para registrar el cliente.");
        payload.dniCliente = dni;
        payload.nombreCliente = nombre;
        payload.apellidoPaterno = apellidoP;
        payload.apellidoMaterno = apellidoM;
        payload.telefonoCliente = telefono;
        payload.emailCliente = email || "";
      }

      const idReserva = await crearReservaConDni(payload);

      try {
        const notif = {
          id: Date.now(), tipo: "reserva",
          fecha: new Date().toISOString(), leido: false,
          habitacion: selectedRoom.descripcion, llegada, salida,
          noches: nights, total,
          nombre: `${nombre} ${apellidoP}`.trim(),
          dni, telefono, email, adultos, notas,
          idReservaBackend: idReserva,
        };
        const prev = JSON.parse(localStorage.getItem("dvita_notificaciones") || "[]");
        localStorage.setItem("dvita_notificaciones", JSON.stringify([notif, ...prev]));
      } catch {}

      setResult({ idReserva });
      setSent(true);

    } catch (err: any) {
      setSendError(err?.message ?? "Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return {
    today, tipos, tiposLoading, habitacion, setHabitacion,
    llegada, setLlegada, salida, setSalida,
    dni, setDni,
    nombre, setNombre,
    apellidoP, setApellidoP,
    apellidoM, setApellidoM,
    telefono, setTelefono,
    email, setEmail,
    adultos, setAdultos,
    notas, setNotas,
    clienteData,
    dniStatus, dniError, dniLoading,
    buscarDni, resetDni,
    step, setStep, canGoStep2, canGoStep3,
    sending, sent, sendError, result, confirmar,
    selectedRoom, nights, total,
    reset,
  };
}
