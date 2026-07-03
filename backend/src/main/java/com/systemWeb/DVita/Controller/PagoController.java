package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.Model.Pago;
import com.systemWeb.DVita.Model.enums.EstadoPago;
import com.systemWeb.DVita.Model.enums.MetodoPago;
import com.systemWeb.DVita.Service.PagoService;
import com.systemWeb.DVita.Service.MicroServicios.PagoPdfService;
import com.systemWeb.DVita.Service.MicroServicios.TicketPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor

public class PagoController {

    private final PagoService pagoService;
    private final PagoPdfService pagoPdfService;
    private final TicketPdfService ticketPdfService;

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleError(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(e.getMessage());
    }

    @GetMapping("/pdf/reporte")
    public ResponseEntity<byte[]> descargarPdf() {
        byte[] pdf = pagoPdfService.generarReportePagos();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=reporte-pagos.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping
    public ResponseEntity<List<Pago>> listarTodos() {
        return ResponseEntity.ok(pagoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pago> buscarPorId(@PathVariable Long id) {
        return pagoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/ticket")
    public ResponseEntity<byte[]> descargarTicket(@PathVariable Long id) {
        Pago pago = pagoService.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado: " + id));
        if (pago.getEstado() != EstadoPago.COMPLETADO) {
            return ResponseEntity.badRequest().body(("El pago debe estar COMPLETADO para generar el ticket").getBytes());
        }
        byte[] pdf = ticketPdfService.generarTicket(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=ticket-pago-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PutMapping("/{id}/completar")
    public ResponseEntity<Pago> completar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String metodoPago = body.get("metodoPago");
        if (metodoPago == null || metodoPago.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(pagoService.completar(id, MetodoPago.valueOf(metodoPago.toUpperCase().trim())));
    }

    @PostMapping
    public ResponseEntity<Pago> crear(@Valid @RequestBody Pago pago) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.guardar(pago));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pago> actualizar(@PathVariable Long id, @Valid @RequestBody Pago pago) {
        return ResponseEntity.ok(pagoService.actualizar(id, pago));
    }


}
