package com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "area")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    private Long idArea;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(name = "nombre", nullable = false, unique = true, length = 50)
    private String nombre;

    @NotBlank(message = "La prioridad base es obligatoria")
    @Pattern(regexp = "BAJA|MEDIA|ALTA|URGENTE",
            message = "La prioridad base debe ser: BAJA, MEDIA, ALTA o URGENTE")
    @Column(name = "prioridad_base", nullable = false, length = 10)
    private String prioridadBase;

    @NotNull(message = "El nivel de prioridad es obligatorio")
    @Min(1) @Max(4)
    @Column(name = "nivel_prioridad", nullable = false)
    private Integer nivelPrioridad;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
