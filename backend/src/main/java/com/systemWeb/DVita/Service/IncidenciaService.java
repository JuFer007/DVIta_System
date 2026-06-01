package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import com.systemWeb.DVita.Repository.IncidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class IncidenciaService {
    private final IncidenciaRepository incidenciaRepository;
    private final EmpleadoRepository empleadoRepository;

    public List<Incidencia> listarTodos() {
        return incidenciaRepository.findAll();
    }

    public Optional<Incidencia> buscarPorId(Long id) {
        return incidenciaRepository.findById(id);
    }

    public List<Incidencia> listarPorEstado(String estado) {
        return incidenciaRepository.findByEstado(estado);
    }

    public List<Incidencia> listarPorPrioridad(String prioridad) {
        return incidenciaRepository.findByPrioridad(prioridad);
    }

    public Incidencia guardar(Incidencia incidencia) {
        if (incidencia.getEmpleadoRegistra() != null && incidencia.getEmpleadoRegistra().getIdEmpleado() != null) {
            Empleado empleado = empleadoRepository.findById(incidencia.getEmpleadoRegistra().getIdEmpleado())
                    .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + incidencia.getEmpleadoRegistra().getIdEmpleado()));
            incidencia.setEmpleadoRegistra(empleado);
        } else {
            incidencia.setEmpleadoRegistra(empleadoRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay empleados registrados para asignar la incidencia")));
        }
        incidencia.setDescripcion(upper(incidencia.getDescripcion()));
        incidencia.setNotasInternas(upper(incidencia.getNotasInternas()));
        return incidenciaRepository.save(incidencia);
    }

    public Incidencia actualizar(Long id, Incidencia incidenciaActualizada) {
        return incidenciaRepository.findById(id).map(incidencia -> {
            if (incidenciaActualizada.getEmpleadoRegistra() != null && incidenciaActualizada.getEmpleadoRegistra().getIdEmpleado() != null) {
                Empleado empleado = empleadoRepository.findById(incidenciaActualizada.getEmpleadoRegistra().getIdEmpleado())
                        .orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + incidenciaActualizada.getEmpleadoRegistra().getIdEmpleado()));
                incidencia.setEmpleadoRegistra(empleado);
            }
            incidencia.setCliente(incidenciaActualizada.getCliente());
            incidencia.setHabitacion(incidenciaActualizada.getHabitacion());
            incidencia.setFecha(incidenciaActualizada.getFecha());
            incidencia.setTipo(incidenciaActualizada.getTipo());
            incidencia.setDescripcion(upper(incidenciaActualizada.getDescripcion()));
            incidencia.setPrioridad(incidenciaActualizada.getPrioridad());
            incidencia.setEstado(incidenciaActualizada.getEstado());
            incidencia.setNotasInternas(upper(incidenciaActualizada.getNotasInternas()));
            return incidenciaRepository.save(incidencia);
        }).orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + id));
    }

    @Transactional
    public Incidencia cambiarEstado(Long id, String nuevoEstado) {
        return incidenciaRepository.findById(id).map(incidencia -> {
            incidencia.setEstado(nuevoEstado);
            if ("RESUELTO".equals(nuevoEstado) || "CERRADO".equals(nuevoEstado)) {
                incidencia.setFechaResolucion(LocalDate.now());
            }
            return incidenciaRepository.save(incidencia);
        }).orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + id));
    }



    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }
}
