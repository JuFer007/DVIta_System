package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Consulta;
import com.systemWeb.DVita.Repository.ConsultaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor

public class ConsultaPdfService {
    private final PdfService pdfService;
    private final ConsultaRepository consultaRepository;

    public byte[] generarReporteConsultas() {
        List<Consulta> consultas = consultaRepository.findAllByOrderByFechaDesc();
        long total = consultas.size();
        long pendientes = consultas.stream().filter(c -> !Boolean.TRUE.equals(c.getRespondido())).count();
        long respondidas = consultas.stream().filter(c -> Boolean.TRUE.equals(c.getRespondido())).count();

        List<Map<String, Object>> consultasList = consultas.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getIdConsulta());
            m.put("nombre", c.getNombre());
            m.put("email", c.getEmail());
            m.put("mensaje", c.getMensaje());
            m.put("fecha", c.getFecha() != null
                ? c.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "—");
            m.put("respondido", Boolean.TRUE.equals(c.getRespondido()));
            m.put("respuesta", c.getRespuesta() != null ? c.getRespuesta() : "—");
            return m;
        }).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("pendientes", pendientes);
        stats.put("respondidas", respondidas);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("consultas", consultasList);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-consultas", data);
    }
}
