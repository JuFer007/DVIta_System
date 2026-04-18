package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Recepcionista;
import com.systemWeb.DVita.Service.RecepcionistaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recepcionistas")
@RequiredArgsConstructor

public class RecepcionistaController {
    private final RecepcionistaService recepcionistaService;

    @GetMapping
    public ResponseEntity<List<Recepcionista>> listarTodos() {
        return ResponseEntity.ok(recepcionistaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recepcionista> buscarPorId(@PathVariable Long id) {
        return recepcionistaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Recepcionista> crear(@Valid @RequestBody Recepcionista recepcionista) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recepcionistaService.guardar(recepcionista));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recepcionista> actualizar(@PathVariable Long id, @Valid @RequestBody Recepcionista recepcionista) {
        return ResponseEntity.ok(recepcionistaService.actualizar(id, recepcionista));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recepcionistaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
