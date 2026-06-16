package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Service.EmpleadoService;
import com.systemWeb.DVita.Service.MicroServicios.EmpleadoPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor

public class EmpleadoController {
    private final EmpleadoService empleadoService;
    private final EmpleadoPdfService empleadoPdfService;

    @GetMapping
    public ResponseEntity<List<Empleado>> listarTodos() {
        return ResponseEntity.ok(empleadoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empleado> buscarPorId(@PathVariable Long id) {
        return empleadoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Empleado> crear(@Valid @RequestBody Empleado empleado) {
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoService.guardar(empleado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empleado> actualizar(@PathVariable Long id, @Valid @RequestBody Empleado empleado) {
        return ResponseEntity.ok(empleadoService.actualizar(id, empleado));
    }

    @GetMapping(value = "/pdf/reporte", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfReporte() {
        return ResponseEntity.ok(empleadoPdfService.generarReporteEmpleados());
    }

    @PatchMapping("/{id}/toggle-activo")
    public ResponseEntity<Empleado> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(empleadoService.toggleActivo(id));
    }
}
