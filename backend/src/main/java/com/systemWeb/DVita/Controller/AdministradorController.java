package main.java.com.systemWeb.DVita.Controller;
import main.java.com.systemWeb.DVita.Model.Administrador;
import main.java.com.systemWeb.DVita.Service.AdministradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/administradores")
@RequiredArgsConstructor

public class AdministradorController {
    private final AdministradorService administradorService;

    @GetMapping
    public ResponseEntity<List<Administrador>> listarTodos() {
        return ResponseEntity.ok(administradorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Administrador> buscarPorId(@PathVariable Long id) {
        return administradorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Administrador> crear(@Valid @RequestBody Administrador administrador) {
        return ResponseEntity.status(HttpStatus.CREATED).body(administradorService.guardar(administrador));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Administrador> actualizar(@PathVariable Long id, @Valid @RequestBody Administrador administrador) {
        return ResponseEntity.ok(administradorService.actualizar(id, administrador));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        administradorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
