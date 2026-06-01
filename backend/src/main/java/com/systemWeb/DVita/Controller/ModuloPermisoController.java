package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Permisos;
import com.systemWeb.DVita.Service.PermisosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
public class ModuloPermisoController {
    private final PermisosService permisosService;

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Permisos>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(permisosService.listarPorUsuario(idUsuario));
    }

    @PutMapping("/usuario/{idUsuario}")
    public ResponseEntity<Void> actualizarPermisos(
            @PathVariable Long idUsuario,
            @RequestBody List<Permisos> permisos) {
        if (idUsuario >= 1 && idUsuario <= 4) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        permisosService.actualizarPermisos(idUsuario, permisos);
        return ResponseEntity.ok().build();
    }
}
