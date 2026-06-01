<<<<<<< HEAD
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
=======
package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Service.HabitacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
>>>>>>> main

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
