package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpleadoPdfService {
    private final PdfService pdfService;
    private final EmpleadoRepository empleadoRepository;

    public byte[] generarReporteEmpleados() {
        List<Empleado> empleados = empleadoRepository.findAll();
        long total = empleados.size();
        long activos = empleados.stream().filter(e -> Boolean.TRUE.equals(e.getActivo())).count();
        long inactivos = empleados.stream().filter(e -> !Boolean.TRUE.equals(e.getActivo())).count();

        List<Map<String, Object>> empleadosList = new ArrayList<>();
        for (int i = 0; i < empleados.size(); i++) {
            Empleado e = empleados.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", i + 1);
            m.put("nombre", e.getNombre() + " " + e.getApellidoP() + " " + e.getApellidoM());
            m.put("dni", e.getDni());
            m.put("telefono", e.getTelefono() != null ? e.getTelefono() : "—");
            m.put("activo", Boolean.TRUE.equals(e.getActivo()));
            empleadosList.add(m);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("activos", activos);
        stats.put("inactivos", inactivos);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("empleados", empleadosList);
        data.put("stats", stats);
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-empleados", data);
    }
}
