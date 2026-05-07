package main.java.com.systemWeb.DVita.Model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String sessionId;
    private String usuario;
    private String paso;
    private String dni;
    private String fechaIngreso;
    private String fechaSalida;
    private Long habitacionId;
    private LocalDateTime actualizadoEn;
}
