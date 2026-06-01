package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Service.MicroServicios.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor

public class EmailController {

    private final EmailService emailService;

    @PostMapping("/enviar")
    public ResponseEntity<Map<String, String>> enviarCorreo(@RequestBody Map<String, String> body) {
        String para = body.get("para");
        String asunto = body.get("asunto");
        String mensaje = body.get("mensaje");

        emailService.enviarCorreo(para, asunto, mensaje);

        return ResponseEntity.ok(Map.of("message", "Correo enviado correctamente"));
    }
}
