package main.java.com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
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

    @NotNull(message = "El recepcionista es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recepcionista", nullable = false)
    private Recepcionista recepcionista;

    @NotNull(message = "La fecha es obligatoria")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @NotBlank(message = "El tipo de turno es obligatorio")
    @Pattern(regexp = "MAÑANA|TARDE|NOCHE|PERSONALIZADO", message = "El turno debe ser: MAÑANA, TARDE, NOCHE o PERSONALIZADO")
    @Column(name = "tipo_turno", nullable = false, length = 15)
    private String tipoTurno;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "PROGRAMADO|EN_CURSO|COMPLETADO|AUSENTE", message = "El estado debe ser: PROGRAMADO, EN_CURSO, COMPLETADO o AUSENTE")
    @Column(name = "estado", nullable = false, length = 15)
    private String estado;

    @Size(max = 300, message = "Las observaciones no pueden superar 300 caracteres")
    @Column(name = "observaciones", length = 300)
    private String observaciones;

    @AssertTrue(message = "La hora de fin debe ser posterior a la hora de inicio (excepto turno NOCHE)")
    @Transient
    public boolean isHorasValidas() {
        if (horaInicio == null || horaFin == null) return true;
        if ("NOCHE".equals(tipoTurno)) return true;
        return horaFin.isAfter(horaInicio);
    }
}
