package com.systemWeb.DVita.Model;
import com.systemWeb.DVita.Model.enums.EstadoIncidencia;
import com.systemWeb.DVita.Model.enums.Prioridad;
import com.systemWeb.DVita.Model.enums.TipoIncidencia;
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

    @NotNull(message = "El tipo es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoIncidencia tipo;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 500, message = "La descripción no puede superar 500 caracteres")
    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridad", nullable = false, length = 10)
    @Builder.Default
    private Prioridad prioridad = Prioridad.MEDIA;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoIncidencia estado = EstadoIncidencia.ABIERTO;

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
