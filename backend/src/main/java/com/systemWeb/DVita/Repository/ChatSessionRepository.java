package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findByUsuario(String usuario);
    void deleteByActualizadoEnBefore(LocalDateTime fecha);
}
