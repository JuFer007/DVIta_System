package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Service.IncidenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {
    private final IncidenciaService incidenciaService;

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

    @PostMapping
    public ResponseEntity<Incidencia> crear(@Valid @RequestBody Incidencia incidencia) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidenciaService.guardar(incidencia));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizar(@PathVariable Long id, @Valid @RequestBody Incidencia incidencia) {
        return ResponseEntity.ok(incidenciaService.actualizar(id, incidencia));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Incidencia> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(incidenciaService.cambiarEstado(id, estado.toUpperCase().trim()));
    }


}
