package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Pago;
import com.systemWeb.DVita.Repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PagoPdfService {
    private final PdfService pdfService;
    private final PagoRepository pagoRepository;

    public byte[] generarReportePagos() {
        List<Pago> pagos = pagoRepository.findAll();

        List<Map<String, Object>> pagosList = new ArrayList<>();
        BigDecimal totalMonto = BigDecimal.ZERO;
        for (Pago p : pagos) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getIdPago());
            m.put("reserva", p.getReserva() != null ? "#" + p.getReserva().getIdReserva() : "—");
            m.put("cliente", p.getReserva() != null && p.getReserva().getCliente() != null
                    ? p.getReserva().getCliente().getNombre() + " " + p.getReserva().getCliente().getApellidoPaterno()
                    : "—");
            m.put("monto", p.getMonto());
            m.put("fecha", p.getFechaPago() != null ? p.getFechaPago().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "—");
            m.put("metodo", p.getMetodoPago() != null ? p.getMetodoPago() : "—");
            pagosList.add(m);
            if (p.getMonto() != null) totalMonto = totalMonto.add(p.getMonto());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pagos", pagosList);
        data.put("total", pagos.size());
        data.put("totalMonto", totalMonto);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-pagos", data);
    }
}
