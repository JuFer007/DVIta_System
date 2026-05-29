package com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 100, message = "El apellido paterno no puede superar 100 caracteres")
    @Column(name = "apellido_paterno", nullable = false, length = 100)
    private String apellidoPaterno;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 100, message = "El apellido materno no puede superar 100 caracteres")
    @Column(name = "apellido_materno", nullable = false, length = 100)
    private String apellidoMaterno;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener exactamente 8 dígitos")
    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{9,15}", message = "El teléfono debe tener entre 9 y 15 dígitos")
    @Column(name = "telefono", nullable = false, length = 15)
    private String telefono;

    @Email(message = "El email debe tener un formato válido")
    @Size(max = 150, message = "El email no puede superar 150 caracteres")
    @Column(name = "email", length = 150)
    private String email;
}
