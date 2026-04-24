package main.java.com.systemWeb.DVita.Controller;
import main.java.com.systemWeb.DVita.Model.TipoHabitacion;
import main.java.com.systemWeb.DVita.Service.TipoHabitacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-habitacion")
@RequiredArgsConstructor

public class TipoHabitacionController {
    private final TipoHabitacionService tipoHabitacionService;

    @GetMapping
    public ResponseEntity<List<TipoHabitacion>> listarTodos() {
        return ResponseEntity.ok(tipoHabitacionService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoHabitacion> buscarPorId(@PathVariable Long id) {
        return tipoHabitacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TipoHabitacion> crear(@Valid @RequestBody TipoHabitacion tipoHabitacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoHabitacionService.guardar(tipoHabitacion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoHabitacion> actualizar(@PathVariable Long id, @Valid @RequestBody TipoHabitacion tipoHabitacion) {
        return ResponseEntity.ok(tipoHabitacionService.actualizar(id, tipoHabitacion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        tipoHabitacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
