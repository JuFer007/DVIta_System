package com.systemWeb.DVita.Model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.systemWeb.DVita.Model.enums.CargoEmpleado;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Empleado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 100, message = "El apellido paterno no puede superar 100 caracteres")
    @Column(name = "apellido_p", nullable = false, length = 100)
    private String apellidoP;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 100, message = "El apellido materno no puede superar 100 caracteres")
    @Column(name = "apellido_m", nullable = false, length = 100)
    private String apellidoM;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener exactamente 8 dígitos")
    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Pattern(regexp = "\\d{9,15}", message = "El teléfono debe tener entre 9 y 15 dígitos")
    @Column(name = "telefono", nullable = false, length = 15)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo", nullable = false, length = 30)
    private CargoEmpleado cargo;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
