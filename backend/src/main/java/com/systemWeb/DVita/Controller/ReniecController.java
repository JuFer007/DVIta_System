package main.java.com.systemWeb.DVita.Controller;
import main.java.com.systemWeb.DVita.DTO.ReniecDataDTO;
import main.java.com.systemWeb.DVita.Service.MicroServicios.ReniecService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reniec")

public class ReniecController {
    @Autowired
    private ReniecService reniecService;

    @GetMapping("/dni/{numero}")
    public ResponseEntity<?> obtenerDatos(@PathVariable String numero) {
        ReniecDataDTO data = reniecService.consultarDni(numero);
        if (data != null) {
            return ResponseEntity.ok(data);
        } else {
            return ResponseEntity.status(500).body("Error al consultar DNI");
        }
    }
}
