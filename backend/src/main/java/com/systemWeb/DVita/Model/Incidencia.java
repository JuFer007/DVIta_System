package com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "incidencia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Incidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incidencia")
    private Long idIncidencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado_registra", nullable = false)
    private Empleado empleadoRegistra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_habitacion")
    private Habitacion habitacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area")
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_incidencia_original")
    private Incidencia incidenciaOriginal;

    @NotNull(message = "La fecha es obligatoria")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "DAÑO_HABITACION|QUEJA_HUESPED|PROBLEMA_SERVICIO|FALLA_EQUIPO|OTRO",
            message = "El tipo debe ser: DAÑO_HABITACION, QUEJA_HUESPED, PROBLEMA_SERVICIO, FALLA_EQUIPO u OTRO")
    @Column(name = "tipo", nullable = false, length = 30)
    private String tipo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @NotBlank(message = "La prioridad es obligatoria")
    @Pattern(regexp = "BAJA|MEDIA|ALTA|URGENTE",
            message = "La prioridad debe ser: BAJA, MEDIA, ALTA o URGENTE")
    @Column(name = "prioridad", nullable = false, length = 10)
    @Builder.Default
    private String prioridad = "MEDIA";

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "ABIERTO|EN_PROCESO|RESUELTO|CERRADO",
            message = "El estado debe ser: ABIERTO, EN_PROCESO, RESUELTO o CERRADO")
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "ABIERTO";

    @Column(name = "fecha_resolucion")
    private LocalDate fechaResolucion;

    @Size(max = 500, message = "Las notas internas no pueden superar 500 caracteres")
    @Column(name = "notas_internas", length = 500)
    private String notasInternas;

    @Column(name = "es_recurrente")
    @Builder.Default
    private Boolean esRecurrente = false;

    @Column(name = "veces_resuelta")
    @Builder.Default
    private Integer vecesResuelta = 0;
}
