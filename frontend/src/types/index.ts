// src/types/index.ts

export interface User {
  idUsuario: number;
  nombreUsuario: string;
  nombre: string;
  rol: string;
  empleado?: Empleado;
}

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  telefono: string;
  email?: string;
}

export interface Empleado {
  idEmpleado: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  dni: string;
  telefono: string;
}

export interface TipoHabitacion {
  idTipoHabitacion: number;
  descripcion: string;
  precio: number;
}

export interface Habitacion {
  idHabitacion: number;
  numeroHabitacion: number;
  estado: "DISPONIBLE" | "OCUPADA" | "MANTENIMIENTO";
  precio: number;
  tipoHabitacion?: TipoHabitacion;
}

export interface Reserva {
  idReserva: number;
  fechaReserva: string;
  fechaIngreso: string;
  fechaSalida: string;
  estadoReserva: "PENDIENTE" | "CONFIRMADA" | "COMPLETADA" | "CANCELADA";
  cliente?: Cliente;
  habitacion?: Habitacion;
  empleado?: Empleado;
}

export interface Pago {
  idPago: number;
  monto: number;
  fechaPago: string;
  metodoPago: string;
  reserva?: Reserva;
}

export interface UsuarioAPI {
  idUsuario: number;
  nombreUsuario: string;
  contrasena: string;
  empleado?: Empleado;
}

export interface Recepcionista {
  idRecepcionista: number;
  turnoTrabajo: string;
  empleado?: Empleado;
}

export interface Administrador {
  idAdministrador: number;
  correoElectronico: string;
  empleado?: Empleado;
}
