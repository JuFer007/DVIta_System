package main.java.com.systemWeb.DVita.Controller;
import lombok.RequiredArgsConstructor;
import main.java.com.systemWeb.DVita.Model.ChatSession;
import main.java.com.systemWeb.DVita.Service.MicroServicios.ChatSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat/session")
@RequiredArgsConstructor

public class ChatSessionController {
    private final ChatSessionService service;

    @GetMapping("/{usuario}")
    public ResponseEntity<?> get(@PathVariable String usuario) {

        return service.find(usuario)
                .<ResponseEntity<?>>map(session ->
                        ResponseEntity.ok(Map.of(
                                "existe", true,
                                "data", session
                        ))
                )
                .orElseGet(() ->
                        ResponseEntity.ok(Map.of(
                                "existe", false
                        ))
                );
    }

    @PostMapping
    public ResponseEntity<ChatSession> create(@RequestBody Map<String, String> body) {

        String usuario = body.get("usuario");
        String dni = body.get("dni");

        ChatSession session = service.find(usuario)
                .orElseGet(() -> service.create(usuario, dni));

        if (dni != null) {
            session.setDni(dni);
        }

        return ResponseEntity.ok(service.update(session));
    }

    @PutMapping
    public ResponseEntity<ChatSession> update(@RequestBody ChatSession session) {

        ChatSession updated = service.update(session);
        return ResponseEntity.ok(updated);
    }
}
