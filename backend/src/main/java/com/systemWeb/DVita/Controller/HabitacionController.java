package main.java.com.systemWeb.DVita.Controller;
import main.java.com.systemWeb.DVita.DTO.HabitacionDTO;
import main.java.com.systemWeb.DVita.DTO.HabitacionRequestDTO;
import main.java.com.systemWeb.DVita.Service.HabitacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/habitaciones")
@RequiredArgsConstructor

public class HabitacionController {
    private final HabitacionService habitacionService;

    @GetMapping
    public ResponseEntity<Page<HabitacionDTO>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "numeroHabitacion") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(habitacionService.listarTodos(pageable));
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<HabitacionDTO>> buscarConFiltros(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long idTipoHabitacion,
            @RequestParam(required = false) Integer numeroHabitacion,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "numeroHabitacion") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return ResponseEntity.ok(habitacionService.buscarConFiltros(
                estado, idTipoHabitacion, numeroHabitacion, precioMin, precioMax, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HabitacionDTO> buscarPorId(@PathVariable Long id) {
        return habitacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<HabitacionDTO> crear(@Valid @RequestBody HabitacionRequestDTO habitacionRequestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitacionService.guardar(habitacionRequestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitacionDTO> actualizar(@PathVariable Long id, @Valid @RequestBody HabitacionRequestDTO habitacionRequestDTO) {
        return ResponseEntity.ok(habitacionService.actualizar(id, habitacionRequestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        habitacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
