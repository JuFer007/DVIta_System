package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.enums.EstadoIncidencia;
import com.systemWeb.DVita.Service.IncidenciaService;
import com.systemWeb.DVita.Service.MicroServicios.IncidenciaPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {
    private final IncidenciaService incidenciaService;
    private final IncidenciaPdfService incidenciaPdfService;

    @GetMapping
    public ResponseEntity<List<Incidencia>> listarTodos() {
        return ResponseEntity.ok(incidenciaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> buscarPorId(@PathVariable Long id) {
        return incidenciaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Incidencia>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(incidenciaService.listarPorEstado(estado));
    }

    @GetMapping("/prioridad/{prioridad}")
    public ResponseEntity<List<Incidencia>> listarPorPrioridad(@PathVariable String prioridad) {
        return ResponseEntity.ok(incidenciaService.listarPorPrioridad(prioridad));
    }

    @GetMapping("/recurrentes")
    public ResponseEntity<List<Incidencia>> listarRecurrentes(
            @RequestParam Long habitacion,
            @RequestParam String tipo) {
        return ResponseEntity.ok(incidenciaService.listarRecurrentes(habitacion, tipo));
    }

    @PostMapping
    public ResponseEntity<Incidencia> crear(@Valid @RequestBody Incidencia incidencia) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidenciaService.guardar(incidencia));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizar(@PathVariable Long id, @Valid @RequestBody Incidencia incidencia) {
        return ResponseEntity.ok(incidenciaService.actualizar(id, incidencia));
    }

    @GetMapping(value = "/pdf/historial/{id}", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaPdfService.generarHistorialIncidencia(id));
    }

    @GetMapping(value = "/pdf/reporte", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfReporte(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(incidenciaPdfService.generarReporteIncidencias(desde, hasta));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Incidencia> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String estado = (String) body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        String solucion = (String) body.get("solucion");
        String notasAuditoria = (String) body.get("notasAuditoria");
        Long idEmpleadoResuelve = null;
        if (body.containsKey("idEmpleadoResuelve")) {
            Object empId = body.get("idEmpleadoResuelve");
            if (empId instanceof Number) {
                idEmpleadoResuelve = ((Number) empId).longValue();
            }
        }
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, EstadoIncidencia.valueOf(estado.toUpperCase().trim()),
                solucion, notasAuditoria, idEmpleadoResuelve));
    }
}
