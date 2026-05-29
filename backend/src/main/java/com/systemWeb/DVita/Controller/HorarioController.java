package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Service.HorarioService;
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
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

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


    @GetMapping("/recepcionista/{idRecepcionista}")
    public ResponseEntity<List<Horario>> listarPorRecepcionista(@PathVariable Long idRecepcionista, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        if (desde != null && hasta != null) {
            return ResponseEntity.ok(
                    horarioService.listarPorRecepcionistaYRango(idRecepcionista, desde, hasta)
            );
        }
        return ResponseEntity.ok(horarioService.listarPorRecepcionista(idRecepcionista));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<Horario>> listarPorFecha(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(horarioService.listarPorFecha(fecha));
    }

    @GetMapping("/en-curso")
    public ResponseEntity<List<Horario>> listarEnCurso() {
        return ResponseEntity.ok(horarioService.listarEnCurso());
    }

    @PostMapping
    public ResponseEntity<Horario> crear(@Valid @RequestBody Horario horario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioService.guardar(horario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Horario> actualizar(@PathVariable Long id, @Valid @RequestBody Horario horario) {
        return ResponseEntity.ok(horarioService.actualizar(id, horario));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Horario> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        if (estado == null || estado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(horarioService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        horarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
