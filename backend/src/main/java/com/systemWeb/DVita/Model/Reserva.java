package main.java.com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "reserva")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;

    @NotNull(message = "El cliente es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @NotNull(message = "La habitación es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_habitacion", nullable = false)
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = true)
    private Empleado empleado;

    @NotNull(message = "La fecha de reserva es obligatoria")
    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;

    @NotNull(message = "La fecha de ingreso es obligatoria")
    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @NotNull(message = "La fecha de salida es obligatoria")
    @Column(name = "fecha_salida", nullable = false)
    private LocalDate fechaSalida;

    @NotBlank(message = "El estado de la reserva es obligatorio")
    @Pattern(
            regexp = "PENDIENTE|CONFIRMADA|CANCELADA|COMPLETADA",
            message = "El estado debe ser: PENDIENTE, CONFIRMADA, CANCELADA o COMPLETADA"
    )
    @Column(name = "estado_reserva", nullable = false, length = 20)
    private String estadoReserva;

    @AssertTrue(message = "La fecha de salida debe ser posterior a la fecha de ingreso")
    @Transient
    public boolean isFechasValidas() {
        if (fechaIngreso == null || fechaSalida == null) return true;
        return fechaSalida.isAfter(fechaIngreso);
    }
}
