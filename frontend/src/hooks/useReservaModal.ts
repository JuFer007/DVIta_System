import { useState } from "react";
import {
  ClienteData,
  buscarClienteEnBD,
  buscarEnReniec,
  buscarHabitacionDisponible,
  crearReservaConDni,
  buscarEmpleadoChatbot,
  buscarHabitacionesDisponibles,
} from "../services/reservaWebService";

export const ROOMS = [
  { value: "estandar", label: "Habitación Estándar", price: 60,  tipoLabel: "Estándar", features: ["TV Cable", "Baño privado", "WiFi"] },
  { value: "suite",    label: "Suite Deluxe",        price: 120, tipoLabel: "Suite",    features: ['TV 50"', "Sala de estar", "Mini bar"] },
  { value: "familiar", label: "Habitación Familiar", price: 180, tipoLabel: "Familiar", features: ["3 camas", "Área adicional", "Frigobar"] },
] as const;

export type RoomValue = typeof ROOMS[number]["value"];
export type Step = 1 | 2 | 3;
export type DniStatus = "" | "bd" | "reniec" | "notfound";
export type RoomAvailability = "available" | "unavailable" | "maintenance" | "loading";

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
  const [roomAvailability, setRoomAvailability] = useState<Record<RoomValue, RoomAvailability>>({
    estandar: "available",
    suite: "available",
    familiar: "available",
  });
  const [dateError, setDateError] = useState("");

  const selectedRoom = ROOMS.find((r) => r.value === habitacion) ?? ROOMS[0];

  const nights = (() => {
    if (!llegada || !salida) return 0;
    const diff = new Date(salida).getTime() - new Date(llegada).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  })();

  const total = nights * selectedRoom.price;

  const canGoStep2 = !!habitacion && !!llegada && !!salida && nights > 0 && !dateError;
  const canGoStep3 = !!nombre && !!apellidoP && !!telefono && !!dni;

  // Validar fechas (máximo 5 meses)
  function validateDates(newLlegada: string, newSalida: string) {
    if (!newLlegada || !newSalida) {
      setDateError("");
      return;
    }

    const llegadaDate = new Date(newLlegada);
    const salidaDate = new Date(newSalida);
    const today = new Date();

    // Validar que la fecha de salida sea posterior a la de llegada
    if (salidaDate <= llegadaDate) {
      setDateError("La fecha de salida debe ser posterior a la fecha de llegada");
      return;
    }

    // Validar máximo 5 meses de anticipación
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 5);

    if (llegadaDate > maxDate) {
      setDateError("Las reservas solo pueden hacerse con máximo 5 meses de anticipación");
      return;
    }

    // Validar que la fecha de llegada no sea en el pasado
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (llegadaDate < todayStart) {
      setDateError("La fecha de llegada no puede ser en el pasado");
      return;
    }

    setDateError("");
  }

  // Cargar disponibilidad de habitaciones
  async function loadRoomAvailability() {
    if (!llegada || !salida) {
      setRoomAvailability({
        estandar: "available",
        suite: "available",
        familiar: "available",
      });
      return;
    }

    setRoomAvailability({
      estandar: "loading",
      suite: "loading",
      familiar: "loading",
    });

    try {
      const availableRooms = await buscarHabitacionesDisponibles(llegada, salida);

      const availability: Record<RoomValue, RoomAvailability> = {
        estandar: "unavailable",
        suite: "unavailable",
        familiar: "unavailable",
      };

      ROOMS.forEach((room) => {
        const hasAvailable = availableRooms.some(
          (h: any) =>
            h.estado === "DISPONIBLE" &&
            h.tipoHabitacion?.descripcion?.toLowerCase().includes(room.tipoLabel.toLowerCase())
        );
        const hasMaintenance = availableRooms.some(
          (h: any) =>
            h.estado === "MANTENIMIENTO" &&
            h.tipoHabitacion?.descripcion?.toLowerCase().includes(room.tipoLabel.toLowerCase())
        );

        if (hasMaintenance) {
          availability[room.value] = "maintenance";
        } else if (hasAvailable) {
          availability[room.value] = "available";
        } else {
          availability[room.value] = "unavailable";
        }
      });

      setRoomAvailability(availability);
    } catch (error) {
      console.error("Error loading room availability:", error);
      setRoomAvailability({
        estandar: "available",
        suite: "available",
        familiar: "available",
      });
    }
  }

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
    setRoomAvailability({
      estandar: "loading",
      suite: "loading",
      familiar: "loading",
    });
    setDateError("");
  }

  // Wrapper para setLlegada con validación
  function setLlegadaWithValidation(value: string) {
    setLlegada(value);
    validateDates(value, salida);
    if (value && salida) {
      loadRoomAvailability();
    }
  }

  // Wrapper para setSalida con validación
  function setSalidaWithValidation(value: string) {
    setSalida(value);
    validateDates(llegada, value);
    if (llegada && value) {
      loadRoomAvailability();
    }
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

  async function confirmar(showToast?: (type: "success" | "warning" | "fail", title: string, message: string) => void) {
    setSending(true);
    setSendError("");

    try {
      const idHabitacion = await buscarHabitacionDisponible(selectedRoom.tipoLabel, llegada, salida);
      if (!idHabitacion) {
        const errorMsg = `No hay habitaciones de tipo "${selectedRoom.label}" disponibles. Llámanos al +51 922 626 148.`;
        setSendError(errorMsg);
        if (showToast) showToast("fail", "Habitación no disponible", errorMsg);
        throw new Error(errorMsg);
      }

      const idEmpleado = await buscarEmpleadoChatbot();

      let payload: any = {
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
          habitacion: selectedRoom.label, llegada, salida,
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

      if (showToast) {
        showToast("success", "¡Reserva confirmada!", `Tu reserva #${idReserva} ha sido registrada exitosamente.`);
      }

    } catch (err: any) {
      const errorMsg = err?.message ?? "Error inesperado. Por favor intenta de nuevo.";
      setSendError(errorMsg);
      if (showToast && !err?.message?.includes("No hay habitaciones")) {
        showToast("fail", "Error al crear reserva", errorMsg);
      }
    } finally {
      setSending(false);
    }
  }

  return {
    today, habitacion, setHabitacion,
    llegada, setLlegada: setLlegadaWithValidation,
    salida, setSalida: setSalidaWithValidation,
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
    roomAvailability, dateError,
  };
}
