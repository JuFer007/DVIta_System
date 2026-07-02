package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Config.SpringUserAdapter;
import com.systemWeb.DVita.Model.Consulta;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Service.ConsultaService;
import com.systemWeb.DVita.Service.MicroServicios.ConsultaPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor

public class ConsultaController {
    private final ConsultaService consultaService;
    private final ConsultaPdfService consultaPdfService;

    @GetMapping
    public ResponseEntity<List<Consulta>> listarTodas() {
        return ResponseEntity.ok(consultaService.listarTodas());
    }

    @GetMapping(value = "/pdf/reporte", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfReporte() {
        return ResponseEntity.ok(consultaPdfService.generarReporteConsultas());
    }

    @PostMapping
    public ResponseEntity<Consulta> crear(@Valid @RequestBody Consulta consulta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consultaService.guardar(consulta));
    }

    @PutMapping("/{id}/responder")
    public ResponseEntity<Consulta> responder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String respuesta = body.get("respuesta");
        if (respuesta == null || respuesta.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof SpringUserAdapter adapter)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Empleado empleado = adapter.getUsuario().getEmpleado();
        return ResponseEntity.ok(consultaService.responder(id, respuesta, empleado));
    }
}
