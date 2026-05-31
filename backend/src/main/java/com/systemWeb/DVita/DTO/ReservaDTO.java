package com.systemWeb.DVita.DTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ReservaDTO {
    private Long idCliente;
    private String dniCliente;
    private String nombreCliente;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String telefonoCliente;
    private String emailCliente;
    private Long idHabitacion;
    private Long idEmpleado;
    private LocalDate fechaReserva;
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
    private String estadoReserva;
}
