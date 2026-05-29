package com.systemWeb.DVita.Service.MicroServicios;
import lombok.RequiredArgsConstructor;
import com.systemWeb.DVita.Model.ChatSession;
import com.systemWeb.DVita.Repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;

    public Optional<ChatSession> find(String usuario) {
        return chatSessionRepository.findByUsuario(usuario);
    }

    public ChatSession create(String usuario, String dni) {

        ChatSession session = ChatSession.builder()
                .usuario(usuario)
                .sessionId(UUID.randomUUID().toString())
                .dni(dni)
                .paso("MENU")
                .actualizadoEn(LocalDateTime.now())
                .build();
        return chatSessionRepository.save(session);
    }

    public ChatSession update(ChatSession s) {

        ChatSession existing = chatSessionRepository.findByUsuario(s.getUsuario())
                .orElseThrow();

        if (s.getPaso() != null) existing.setPaso(s.getPaso());
        if (s.getDni() != null) existing.setDni(s.getDni());
        if (s.getFechaIngreso() != null) existing.setFechaIngreso(s.getFechaIngreso());
        if (s.getFechaSalida() != null) existing.setFechaSalida(s.getFechaSalida());
        if (s.getHabitacionId() != null) existing.setHabitacionId(s.getHabitacionId());

        existing.setActualizadoEn(LocalDateTime.now());

        return chatSessionRepository.save(existing);
    }
}
