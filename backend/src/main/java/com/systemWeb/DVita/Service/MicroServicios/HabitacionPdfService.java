package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Model.enums.EstadoHabitacion;
import com.systemWeb.DVita.Repository.HabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor

public class HabitacionPdfService {
    private final PdfService pdfService;
    private final HabitacionRepository habitacionRepository;

    @Transactional(readOnly = true)
    public byte[] generarReporteHabitaciones() {
        List<Habitacion> habitaciones = habitacionRepository.findAll();
        long total = habitaciones.size();
        long disponibles = habitaciones.stream().filter(h -> EstadoHabitacion.DISPONIBLE == h.getEstado()).count();
        long ocupadas = habitaciones.stream().filter(h -> EstadoHabitacion.OCUPADA == h.getEstado()).count();
        long mantenimiento = habitaciones.stream().filter(h -> EstadoHabitacion.MANTENIMIENTO == h.getEstado()).count();
        long limpieza = habitaciones.stream().filter(h -> EstadoHabitacion.EN_LIMPIEZA == h.getEstado()).count();
        long pctOcupacion = total > 0 ? (ocupadas * 100 / total) : 0;

        List<Map<String, Object>> habitacionesList = habitaciones.stream().map(h -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("numero", h.getNumeroHabitacion());
            m.put("tipo", h.getTipoHabitacion() != null ? h.getTipoHabitacion().getDescripcion() : "—");
            m.put("estado", h.getEstado() != null ? h.getEstado() : "—");
            m.put("precio", h.getPrecio() != null ? String.format("S/. %.2f", h.getPrecio()) : "—");
            return m;
        }).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("disponibles", disponibles);
        stats.put("ocupadas", ocupadas);
        stats.put("mantenimiento", mantenimiento);
        stats.put("limpieza", limpieza);
        stats.put("pctOcupacion", pctOcupacion);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("habitaciones", habitacionesList);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-habitaciones", data);
    }
}
