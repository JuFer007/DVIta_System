package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor

public class ReporteFinancieroPdfService {
    private final PdfService pdfService;
    private final DashboardService dashboardService;

    public byte[] generarReporteFinanciero() {
        List<Map<String, Object>> ingresosMensuales = dashboardService.getIngresosMensuales();
        List<Map<String, Object>> metodosPago = dashboardService.getMetodosPago();
        Map<String, Object> dashboardStats = dashboardService.getStats();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("ingresosMes", dashboardStats.getOrDefault("ingresosMes", 0));
        stats.put("pctCambio", dashboardStats.getOrDefault("pctCambioIngresos", 0));
        stats.put("totalPagos", ingresosMensuales.stream()
                .flatMap(m -> {
                    Object pagos = m.get("pagos");
                    if (pagos instanceof Number) return java.util.stream.Stream.of(((Number) pagos).longValue());
                    return java.util.stream.Stream.of(0L);
                }).mapToLong(Long::longValue).sum());
        stats.put("ocupacion", dashboardStats.getOrDefault("habitacionesDisponibles", 0));
        stats.put("habitacionesTotal", dashboardStats.getOrDefault("habitacionesTotal", 0));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("ingresosMensuales", ingresosMensuales);
        data.put("metodosPago", metodosPago);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-financiero", data);
    }
}
