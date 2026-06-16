package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import com.systemWeb.DVita.Service.IncidenciaResolucionService;
import com.systemWeb.DVita.Model.Empleado;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidencias/{incidenciaId}/resoluciones")
@RequiredArgsConstructor
public class IncidenciaResolucionController {
    private final IncidenciaResolucionService service;

    @GetMapping
    public ResponseEntity<List<IncidenciaResolucion>> listar(@PathVariable Long incidenciaId) {
        return ResponseEntity.ok(service.listarPorIncidencia(incidenciaId));
    }

    @PostMapping
    public ResponseEntity<IncidenciaResolucion> crear(
            @PathVariable Long incidenciaId,
            @RequestBody Map<String, Object> body) {
        IncidenciaResolucion resolucion = IncidenciaResolucion.builder()
                .incidencia(Incidencia.builder().idIncidencia(incidenciaId).build())
                .fechaResolucion(LocalDate.now())
                .solucion((String) body.get("solucion"))
                .notasAuditoria((String) body.get("notasAuditoria"))
                .build();
        if (body.containsKey("idEmpleadoResuelve")) {
            Object empId = body.get("idEmpleadoResuelve");
            if (empId instanceof Number) {
                resolucion.setEmpleadoResuelve(
                        Empleado.builder().idEmpleado(((Number) empId).longValue()).build());
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(resolucion));
    }
}
