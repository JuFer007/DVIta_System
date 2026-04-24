package main.java.com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "recepcionista")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Recepcionista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recepcionista")
    private Long idRecepcionista;

    @NotNull(message = "El empleado es obligatorio")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_empleado", nullable = false, unique = true)
    private Empleado empleado;

    @NotBlank(message = "El turno de trabajo es obligatorio")
    @Size(max = 20, message = "El turno de trabajo no puede superar 20 caracteres")
    @Column(name = "turno_trabajo", nullable = false, length = 20)
    private String turnoTrabajo;
}
