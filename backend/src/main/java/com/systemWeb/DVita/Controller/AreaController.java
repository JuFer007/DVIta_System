package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Area;
import com.systemWeb.DVita.Service.AreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaController {
    private final AreaService areaService;

    @GetMapping
    public ResponseEntity<List<Area>> listarTodas() {
        return ResponseEntity.ok(areaService.listarTodas());
    }

    @GetMapping("/todas")
    public ResponseEntity<List<Area>> listarTodasAdmin() {
        return ResponseEntity.ok(areaService.listarTodasAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Area> buscarPorId(@PathVariable Long id) {
        return areaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Area> crear(@Valid @RequestBody Area area) {
        return ResponseEntity.status(HttpStatus.CREATED).body(areaService.guardar(area));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Area> actualizar(@PathVariable Long id, @Valid @RequestBody Area area) {
        return ResponseEntity.ok(areaService.actualizar(id, area));
    }
}
