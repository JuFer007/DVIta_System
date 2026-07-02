package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor

public class HorarioPdfService {
    private final PdfService pdfService;
    private final HorarioRepository horarioRepository;

    private static final List<String> DIAS_SEMANA = List.of(
        "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"
    );

    @Transactional(readOnly = true)
    public byte[] generarReporteHorarios() {
        List<Horario> horarios = horarioRepository.findAll();
        long totalHorarios = horarios.size();

        Map<Long, Map<String, List<Horario>>> agrupado = new LinkedHashMap<>();
        Map<Long, Empleado> empleadosMap = new LinkedHashMap<>();
        for (Horario h : horarios) {
            Empleado e = h.getEmpleado();
            Long eid = e.getIdEmpleado();
            empleadosMap.putIfAbsent(eid, e);
            agrupado.computeIfAbsent(eid, k -> new LinkedHashMap<>());
            agrupado.get(eid).computeIfAbsent(h.getDiaSemana(), k -> new ArrayList<>()).add(h);
        }
        long empleadosConHorario = empleadosMap.size();

        List<Map<String, Object>> filas = new ArrayList<>();
        for (Map.Entry<Long, Empleado> entry : empleadosMap.entrySet()) {
            Empleado e = entry.getValue();
            Map<String, List<Horario>> diaMap = agrupado.get(entry.getKey());
            Map<String, Object> fila = new LinkedHashMap<>();
            fila.put("empleado", (e.getNombre() + " " + e.getApellidoP() + " " + e.getApellidoM()).trim());
            fila.put("dni", e.getDni());
            fila.put("cargo", e.getCargo() != null ? e.getCargo().name() : "—");

            Map<String, Object> dias = new LinkedHashMap<>();
            int turnosActivos = 0;
            for (String d : DIAS_SEMANA) {
                List<Horario> lista = diaMap != null ? diaMap.get(d) : null;
                if (lista != null && !lista.isEmpty()) {
                    Horario h = lista.get(0);
                    Map<String, Object> info = new LinkedHashMap<>();
                    info.put("horaInicio", h.getHoraInicio() != null ? h.getHoraInicio().toString() : "—");
                    info.put("horaFin", h.getHoraFin() != null ? h.getHoraFin().toString() : "—");
                    info.put("tipoTurno", h.getTipoTurno() != null ? h.getTipoTurno().name() : "—");
                    info.put("estado", h.getEstado() != null ? h.getEstado().name() : "—");
                    dias.put(d, info);
                    turnosActivos++;
                } else {
                    dias.put(d, null);
                }
            }
            fila.put("dias", dias);
            fila.put("turnosActivos", turnosActivos);
            filas.add(fila);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalHorarios", totalHorarios);
        stats.put("empleadosConHorario", empleadosConHorario);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("stats", stats);
        data.put("filas", filas);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-horarios", data);
    }
}
