package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Service.HabitacionService;
import com.systemWeb.DVita.Service.MicroServicios.HabitacionPdfService;
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
@RequestMapping("/api/habitaciones")
@RequiredArgsConstructor

public class HabitacionController {
    private final HabitacionService habitacionService;
    private final HabitacionPdfService habitacionPdfService;

    @GetMapping
    public ResponseEntity<List<Habitacion>> listarTodos() {
        return ResponseEntity.ok(habitacionService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habitacion> buscarPorId(@PathVariable Long id) {
        return habitacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Habitacion> crear(@Valid @RequestBody Habitacion habitacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitacionService.guardar(habitacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habitacion> actualizar(@PathVariable Long id, @Valid @RequestBody Habitacion habitacion) {
        return ResponseEntity.ok(habitacionService.actualizar(id, habitacion));
    }



    @GetMapping("/disponibles")
    public ResponseEntity<List<Habitacion>> habitacionesDisponibles(
            @RequestParam("fechaIngreso") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaIngreso,
            @RequestParam("fechaSalida") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaSalida,
            @RequestParam(value = "tipoId", required = false) Long tipoId
    ) {
        List<Habitacion> disponibles = tipoId != null
                ? habitacionService.disponiblesPorTipo(tipoId, fechaIngreso, fechaSalida)
                : habitacionService.habitacionesDisponibles(fechaIngreso, fechaSalida);
        return ResponseEntity.ok(disponibles);
    }

    @GetMapping(value = "/pdf/reporte", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfReporte() {
        return ResponseEntity.ok(habitacionPdfService.generarReporteHabitaciones());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Habitacion> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(habitacionService.cambiarEstado(id, nuevoEstado.toUpperCase().trim()));
    }
}
