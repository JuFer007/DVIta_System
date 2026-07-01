package com.systemWeb.DVita.Model;
import com.systemWeb.DVita.Model.enums.EstadoHorario;
import com.systemWeb.DVita.Model.enums.TipoTurno;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_horario")
    private Long idHorario;

    @NotNull(message = "El empleado es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleado empleado;

    @NotNull(message = "El dia de semana es obligatorio")
    @Column(name = "dia_semana", nullable = false, length = 15)
    private String diaSemana;

    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @NotNull(message = "El tipo de turno es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_turno", nullable = false, length = 15)
    private TipoTurno tipoTurno;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 15)
    private EstadoHorario estado;

    @Size(max = 300, message = "Las observaciones no pueden superar 300 caracteres")
    @Column(name = "observaciones", length = 300)
    private String observaciones;

    @AssertTrue(message = "La hora de fin debe ser posterior a la hora de inicio (excepto turno NOCHE)")
    @Transient
    public boolean isHorasValidas() {
        if (horaInicio == null || horaFin == null) return true;
        if (TipoTurno.NOCHE == tipoTurno) return true;
        return horaFin.isAfter(horaInicio);
    }
}
