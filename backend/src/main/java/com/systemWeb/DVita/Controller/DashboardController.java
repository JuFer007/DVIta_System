package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Repository.*;
import com.systemWeb.DVita.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/reservas-recientes")
    public ResponseEntity<List<Map<String, Object>>> getReservasRecientes() {
        return ResponseEntity.ok(dashboardService.getReservasRecientes());
    }

    @GetMapping("/habitaciones-estado")
    public ResponseEntity<List<Map<String, Object>>> getHabitacionesEstado() {
        return ResponseEntity.ok(dashboardService.getHabitacionesEstado());
    }

    @GetMapping("/ingresos-mensuales")
    public ResponseEntity<List<Map<String, Object>>> getIngresosMensuales() {
        return ResponseEntity.ok(dashboardService.getIngresosMensuales());
    }

    @GetMapping("/reservas-por-estado")
    public ResponseEntity<Map<String, Long>> getReservasPorEstado() {
        return ResponseEntity.ok(dashboardService.getReservasPorEstado());
    }

    @GetMapping("/metodos-pago")
    public ResponseEntity<List<Map<String, Object>>> getMetodosPago() {
        return ResponseEntity.ok(dashboardService.getMetodosPago());
    }

    @GetMapping("/ocupacion-por-tipo")
    public ResponseEntity<List<Map<String, Object>>> getOcupacionPorTipo() {
        return ResponseEntity.ok(dashboardService.getOcupacionPorTipo());
    }
}