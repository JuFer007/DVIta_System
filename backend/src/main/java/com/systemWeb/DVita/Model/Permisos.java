package com.systemWeb.DVita.Model;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "modulo_permiso")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Permisos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo_permiso")
    private Long idModuloPermiso;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnoreProperties({"permisos"})
    private Usuario usuario;

    @NotBlank(message = "El módulo es obligatorio")
    @Size(max = 30, message = "El módulo no puede superar 30 caracteres")
    @Column(name = "modulo", nullable = false, length = 30)
    private String modulo;

    @Column(name = "puede_acceder", nullable = false)
    @Builder.Default
    private Boolean puedeAcceder = true;
}
