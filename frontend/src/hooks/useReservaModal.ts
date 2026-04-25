import { useState } from "react";
import {
  ClienteData,
  buscarClienteEnBD,
  buscarEnReniec,
  crearCliente,
  buscarHabitacionDisponible,
  crearReserva,
  crearPago,
} from "../services/reservaWebService";

export const ROOMS = [
  { value: "estandar", label: "Habitación Estándar", price: 60,  tipoLabel: "Estándar", features: ["TV Cable", "Baño privado", "WiFi"] },
  { value: "suite",    label: "Suite Deluxe",        price: 120, tipoLabel: "Suite",    features: ['TV 50"', "Sala de estar", "Mini bar"] },
  { value: "familiar", label: "Habitación Familiar", price: 180, tipoLabel: "Familiar", features: ["3 camas", "Área adicional", "Frigobar"] },
] as const;

export type RoomValue = typeof ROOMS[number]["value"];
export type Step = 1 | 2 | 3;
export type DniStatus = "" | "bd" | "reniec" | "notfound";

export interface ReservaResult {
  idReserva: number;
  idPago?: number;
}

export function useReservaModal(initialRoom: RoomValue = "estandar") {
  const today = new Date().toISOString().split("T")[0];
  const [habitacion, setHabitacion] = useState<RoomValue>(initialRoom);
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

  const selectedRoom = ROOMS.find((r) => r.value === habitacion) ?? ROOMS[0];

  const nights = (() => {
    if (!llegada || !salida) return 0;
    const diff = new Date(salida).getTime() - new Date(llegada).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  })();

  const total = nights * selectedRoom.price;

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
    setHabitacion(initialRoom);
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
    setSending(true);
    setSendError("");

    try {
      let idCliente: number;
      if (clienteData?.idCliente) {
        idCliente = clienteData.idCliente;
      } else {
        if (!telefono) throw new Error("El teléfono es obligatorio para registrar el cliente.");
        idCliente = await crearCliente({
          nombre, apellidoPaterno: apellidoP, apellidoMaterno: apellidoM,
          dni, telefono, email: email || null,
        });
      }

      const idHabitacion = await buscarHabitacionDisponible(selectedRoom.tipoLabel);
      if (!idHabitacion) {
        throw new Error(
          `No hay habitaciones de tipo "${selectedRoom.label}" disponibles. Llámanos al +51 922 626 148.`
        );
      }

      const idReserva = await crearReserva({
        cliente:    { idCliente },
        habitacion: { idHabitacion },
        fechaReserva: today,
        fechaIngreso: llegada,
        fechaSalida:  salida,
        estadoReserva: "PENDIENTE",
      });

      let idPago: number | undefined;
      try {
        idPago = await crearPago(idReserva, total, today);
      } catch {
        console.warn("Pago no creado automáticamente — se registrará en recepción.");
      }

      try {
        const notif = {
          id: Date.now(), tipo: "reserva",
          fecha: new Date().toISOString(), leido: false,
          habitacion: selectedRoom.label, llegada, salida,
          noches: nights, total,
          nombre: `${nombre} ${apellidoP}`.trim(),
          dni, telefono, email, adultos, notas,
          idReservaBackend: idReserva,
        };
        const prev = JSON.parse(localStorage.getItem("dvita_notificaciones") || "[]");
        localStorage.setItem("dvita_notificaciones", JSON.stringify([notif, ...prev]));
      } catch {}

      setResult({ idReserva, idPago });
      setSent(true);

    } catch (err: any) {
      setSendError(err?.message ?? "Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return {
    today, habitacion, setHabitacion,
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
