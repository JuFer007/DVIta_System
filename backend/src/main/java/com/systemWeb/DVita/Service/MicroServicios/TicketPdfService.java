package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Pago;
import com.systemWeb.DVita.Model.enums.MetodoPago;
import com.systemWeb.DVita.Repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor

public class TicketPdfService {
    private final PdfService pdfService;
    private final PagoRepository pagoRepository;

    public byte[] generarTicket(Long idPago) {
        Pago pago = pagoRepository.findById(idPago)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado: " + idPago));

        var reserva = pago.getReserva();
        var cliente = reserva != null ? reserva.getCliente() : null;
        var habitacion = reserva != null ? reserva.getHabitacion() : null;
        var tipoHabitacion = habitacion != null ? habitacion.getTipoHabitacion() : null;

        long noches = reserva != null ? reserva.getNoches() : 1;
        String metodoLabel = "";
        if (pago.getMetodoPago() != null) {
            metodoLabel = switch (pago.getMetodoPago()) {
                case EFECTIVO -> "Efectivo";
                case TARJETA_CREDITO -> "Tarjeta Crédito";
                case TARJETA_DEBITO -> "Tarjeta Débito";
                case TRANSFERENCIA -> "Transferencia";
                case YAPE -> "Yape";
                case PLIN -> "Plin";
            };
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("idPago", String.valueOf(pago.getIdPago()));
        data.put("idReserva", reserva != null ? String.valueOf(reserva.getIdReserva()) : "—");
        data.put("fechaPago", pago.getFechaPago() != null
                ? pago.getFechaPago().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "—");
        data.put("metodoPago", metodoLabel);
        data.put("cliente", cliente != null
                ? cliente.getNombre() + " " + cliente.getApellidoPaterno() + " " + cliente.getApellidoMaterno() : "—");
        data.put("dni", cliente != null ? cliente.getDni() : "—");
        data.put("tipoHabitacion", tipoHabitacion != null ? tipoHabitacion.getDescripcion() : "—");
        data.put("habitacion", habitacion != null ? String.valueOf(habitacion.getNumeroHabitacion()) : "—");
        data.put("fechaIngreso", reserva != null && reserva.getFechaIngreso() != null
                ? reserva.getFechaIngreso().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "—");
        data.put("fechaSalida", reserva != null && reserva.getFechaSalida() != null
                ? reserva.getFechaSalida().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "—");
        data.put("noches", String.valueOf(noches));
        data.put("subtotal", String.format("%.2f", pago.getMonto() != null ? pago.getMonto() : BigDecimal.ZERO));
        data.put("descuento", "0.00");
        data.put("monto", String.format("%.2f", pago.getMonto() != null ? pago.getMonto() : BigDecimal.ZERO));

        String tipoLabel = tipoHabitacion != null ? tipoHabitacion.getDescripcion() : "";
        String nocheText = noches == 1 ? "noche" : "noches";
        String concepto = String.format("Hospedaje - %s (%d %s)", tipoLabel, noches, nocheText);
        String montoStr = String.format("%.2f", pago.getMonto() != null ? pago.getMonto() : BigDecimal.ZERO);
        List<Map<String, Object>> serviciosList = new ArrayList<>();
        Map<String, Object> servicio = new LinkedHashMap<>();
        servicio.put("concepto", concepto);
        servicio.put("monto", montoStr);
        serviciosList.add(servicio);
        data.put("servicios", serviciosList);

        return pdfService.generarPdf("/generar-ticket-pago", data);
    }
}
