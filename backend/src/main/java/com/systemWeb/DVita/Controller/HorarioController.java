package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Model.enums.EstadoHorario;
import com.systemWeb.DVita.Service.HorarioService;
import com.systemWeb.DVita.Service.MicroServicios.HorarioPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor

public class HorarioController {

    private final HorarioService horarioService;
    private final HorarioPdfService horarioPdfService;

    @GetMapping
    public ResponseEntity<List<Horario>> listarTodos() {
        return ResponseEntity.ok(horarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Horario> buscarPorId(@PathVariable Long id) {
        return horarioService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/empleado/{idEmpleado}")
    public ResponseEntity<List<Horario>> listarPorEmpleado(@PathVariable Long idEmpleado) {
        return ResponseEntity.ok(horarioService.listarPorEmpleado(idEmpleado));
    }

    @GetMapping("/verificar-acceso/{idEmpleado}")
    public ResponseEntity<Map<String, Object>> verificarAcceso(@PathVariable Long idEmpleado) {
        return ResponseEntity.ok(horarioService.verificarAcceso(idEmpleado));
    }

    @PostMapping
    public ResponseEntity<Horario> crear(@Valid @RequestBody Horario horario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioService.guardar(horario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Horario> actualizar(@PathVariable Long id, @Valid @RequestBody Horario horario) {
        return ResponseEntity.ok(horarioService.actualizar(id, horario));
    }

    @GetMapping(value = "/pdf/reporte", produces = "application/pdf")
    public ResponseEntity<byte[]> pdfReporte() {
        return ResponseEntity.ok(horarioPdfService.generarReporteHorarios());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        horarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Horario> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(horarioService.cambiarEstado(id, EstadoHorario.valueOf(estado.toUpperCase().trim())));
    }


}
