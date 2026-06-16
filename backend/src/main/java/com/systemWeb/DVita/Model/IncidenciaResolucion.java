package com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "incidencia_resolucion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class IncidenciaResolucion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resolucion")
    private Long idResolucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_incidencia", nullable = false)
    private Incidencia incidencia;

    @NotNull(message = "La versión es obligatoria")
    @Column(name = "version", nullable = false)
    private Integer version;

    @NotNull(message = "La fecha de resolución es obligatoria")
    @Column(name = "fecha_resolucion", nullable = false)
    private LocalDate fechaResolucion;

    @Size(max = 1000, message = "La solución no puede superar 1000 caracteres")
    @Column(name = "solucion", length = 1000)
    private String solucion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado_resuelve")
    private Empleado empleadoResuelve;

    @Size(max = 500, message = "Las notas de auditoría no pueden superar 500 caracteres")
    @Column(name = "notas_auditoria", length = 500)
    private String notasAuditoria;
}
