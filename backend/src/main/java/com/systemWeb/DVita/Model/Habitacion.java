package com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "habitacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Habitacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_habitacion")
    private Long idHabitacion;

    @NotNull(message = "El tipo de habitación es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_habitacion", nullable = false)
    private TipoHabitacion tipoHabitacion;

    @NotNull(message = "El número de habitación es obligatorio")
    @Positive(message = "El número de habitación debe ser positivo")
    @Column(name = "numero_habitacion", nullable = false, unique = true)
    private Integer numeroHabitacion;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "DISPONIBLE|OCUPADA|MANTENIMIENTO|EN_LIMPIEZA", message = "El estado debe ser: DISPONIBLE, OCUPADA, MANTENIMIENTO o EN_LIMPIEZA")
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @Transient
    public BigDecimal getPrecio() {
        return tipoHabitacion != null ? tipoHabitacion.getPrecio() : BigDecimal.ZERO;
    }
}
