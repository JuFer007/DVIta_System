package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import com.systemWeb.DVita.Repository.IncidenciaRepository;
import com.systemWeb.DVita.Repository.IncidenciaResolucionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidenciaPdfService {
    private final PdfService pdfService;
    private final IncidenciaRepository incidenciaRepository;
    private final IncidenciaResolucionRepository incidenciaResolucionRepository;

    public byte[] generarHistorialIncidencia(Long idIncidencia) {
        Incidencia inc = incidenciaRepository.findById(idIncidencia)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada: " + idIncidencia));
        List<IncidenciaResolucion> resoluciones = incidenciaResolucionRepository
                .findByIncidencia_IdIncidenciaOrderByVersionAsc(idIncidencia);

        Map<String, Object> incMap = new LinkedHashMap<>();
        incMap.put("id", inc.getIdIncidencia());
        incMap.put("descripcion", inc.getDescripcion());
        incMap.put("tipo", inc.getTipo());
        incMap.put("prioridad", inc.getPrioridad());
        incMap.put("estado", inc.getEstado());
        incMap.put("fecha", inc.getFecha() != null ? inc.getFecha().toString() : "—");
        incMap.put("fechaResolucion", inc.getFechaResolucion() != null ? inc.getFechaResolucion().toString() : "—");
        incMap.put("esRecurrente", Boolean.TRUE.equals(inc.getEsRecurrente()));
        incMap.put("vecesResuelta", inc.getVecesResuelta() != null ? inc.getVecesResuelta() : 0);
        incMap.put("empleadoRegistra", inc.getEmpleadoRegistra() != null
                ? inc.getEmpleadoRegistra().getNombre() + " " + inc.getEmpleadoRegistra().getApellidoP() : "—");
        incMap.put("area", inc.getArea() != null ? inc.getArea().getNombre() : "—");
        incMap.put("habitacion", inc.getHabitacion() != null
                ? String.valueOf(inc.getHabitacion().getNumeroHabitacion()) : "—");
        incMap.put("cliente", inc.getCliente() != null
                ? inc.getCliente().getNombre() + " " + inc.getCliente().getApellidoPaterno() : "—");
        incMap.put("notasInternas", inc.getNotasInternas() != null ? inc.getNotasInternas() : "—");

        List<Map<String, Object>> resolucionesList = resoluciones.stream().map(r -> {
            Map<String, Object> rm = new LinkedHashMap<>();
            rm.put("version", r.getVersion());
            rm.put("fechaResolucion", r.getFechaResolucion() != null ? r.getFechaResolucion().toString() : "—");
            rm.put("solucion", r.getSolucion() != null ? r.getSolucion() : "—");
            rm.put("empleado", r.getEmpleadoResuelve() != null
                    ? r.getEmpleadoResuelve().getNombre() + " " + r.getEmpleadoResuelve().getApellidoP() : "—");
            rm.put("notasAuditoria", r.getNotasAuditoria() != null ? r.getNotasAuditoria() : "—");
            return rm;
        }).toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("incidencia", incMap);
        data.put("resoluciones", resolucionesList);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-historial-incidencia", data);
    }

    public byte[] generarReporteIncidencias(LocalDate desde, LocalDate hasta) {
        List<Incidencia> incidencias = incidenciaRepository.findByFechaBetween(desde, hasta);

        long total = incidencias.size();
        long abierto = incidencias.stream().filter(i -> "ABIERTO".equals(i.getEstado())).count();
        long enProceso = incidencias.stream().filter(i -> "EN_PROCESO".equals(i.getEstado())).count();
        long resuelto = incidencias.stream().filter(i -> "RESUELTO".equals(i.getEstado())).count();
        long cerrado = incidencias.stream().filter(i -> "CERRADO".equals(i.getEstado())).count();
        long urgente = incidencias.stream().filter(i -> "URGENTE".equals(i.getPrioridad())).count();
        long alta = incidencias.stream().filter(i -> "ALTA".equals(i.getPrioridad())).count();
        long media = incidencias.stream().filter(i -> "MEDIA".equals(i.getPrioridad())).count();
        long baja = incidencias.stream().filter(i -> "BAJA".equals(i.getPrioridad())).count();

        List<Map<String, Object>> incidenciasList = incidencias.stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", i.getIdIncidencia());
            m.put("descripcion", i.getDescripcion());
            m.put("tipo", i.getTipo());
            m.put("area", i.getArea() != null ? i.getArea().getNombre() : "—");
            m.put("prioridad", i.getPrioridad());
            m.put("estado", i.getEstado());
            m.put("fecha", i.getFecha() != null ? i.getFecha().toString() : "—");
            return m;
        }).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("abierto", abierto);
        stats.put("enProceso", enProceso);
        stats.put("resuelto", resuelto);
        stats.put("cerrado", cerrado);
        stats.put("urgente", urgente);
        stats.put("alta", alta);
        stats.put("media", media);
        stats.put("baja", baja);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("incidencias", incidenciasList);
        data.put("desde", desde.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        data.put("hasta", hasta.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-incidencias", data);
    }
}
