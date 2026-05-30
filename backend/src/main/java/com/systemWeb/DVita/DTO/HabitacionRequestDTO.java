package main.java.com.systemWeb.DVita.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitacionRequestDTO {
    @NotNull(message = "El tipo de habitación es obligatorio")
    private Long idTipoHabitacion;

    @NotNull(message = "El número de habitación es obligatorio")
    @Positive(message = "El número de habitación debe ser positivo")
    private Integer numeroHabitacion;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "DISPONIBLE|OCUPADA|MANTENIMIENTO", message = "El estado debe ser: DISPONIBLE, OCUPADA o MANTENIMIENTO")
    private String estado;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
    private BigDecimal precio;
}
