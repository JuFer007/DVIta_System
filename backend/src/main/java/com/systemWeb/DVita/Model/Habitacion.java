package com.systemWeb.DVita.Model;
import com.systemWeb.DVita.Model.enums.EstadoHabitacion;
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

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoHabitacion estado;

    @Transient
    public BigDecimal getPrecio() {
        return tipoHabitacion != null ? tipoHabitacion.getPrecio() : BigDecimal.ZERO;
    }
}
