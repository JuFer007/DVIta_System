package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Area;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import com.systemWeb.DVita.Repository.AreaRepository;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import com.systemWeb.DVita.Repository.IncidenciaRepository;
import com.systemWeb.DVita.Repository.IncidenciaResolucionRepository;
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
    private final AreaRepository areaRepository;
    private final IncidenciaResolucionRepository incidenciaResolucionRepository;

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

    public List<Incidencia> listarRecurrentes(Long idHabitacion, String tipo) {
        return incidenciaRepository.findByHabitacion_IdHabitacionAndTipoAndEstadoIn(
                idHabitacion, tipo, List.of("RESUELTO", "CERRADO"));
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

        detectarRecurrencia(incidencia);
        asignarPrioridad(incidencia);

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
            incidencia.setArea(incidenciaActualizada.getArea());
            incidencia.setFecha(incidenciaActualizada.getFecha());
            incidencia.setTipo(incidenciaActualizada.getTipo());
            incidencia.setDescripcion(upper(incidenciaActualizada.getDescripcion()));
            incidencia.setEstado(incidenciaActualizada.getEstado());
            incidencia.setNotasInternas(upper(incidenciaActualizada.getNotasInternas()));

            detectarRecurrencia(incidencia);
            asignarPrioridad(incidencia);

            return incidenciaRepository.save(incidencia);
        }).orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + id));
    }

    @Transactional
    public Incidencia cambiarEstado(Long id, String nuevoEstado, String solucion, String notasAuditoria, Long idEmpleadoResuelve) {
        return incidenciaRepository.findById(id).map(incidencia -> {
            incidencia.setEstado(nuevoEstado);
            if ("RESUELTO".equals(nuevoEstado)) {
                incidencia.setFechaResolucion(LocalDate.now());

                IncidenciaResolucion resolucion = IncidenciaResolucion.builder()
                        .incidencia(incidencia)
                        .version(incidencia.getVecesResuelta() + 1)
                        .fechaResolucion(LocalDate.now())
                        .solucion(upper(solucion))
                        .notasAuditoria(upper(notasAuditoria))
                        .build();
                if (idEmpleadoResuelve != null) {
                    empleadoRepository.findById(idEmpleadoResuelve).ifPresent(resolucion::setEmpleadoResuelve);
                }
                incidenciaResolucionRepository.save(resolucion);

                incidencia.setVecesResuelta(incidencia.getVecesResuelta() + 1);
            }
            if ("CERRADO".equals(nuevoEstado)) {
                if (incidencia.getFechaResolucion() == null) {
                    incidencia.setFechaResolucion(LocalDate.now());
                }
            }
            return incidenciaRepository.save(incidencia);
        }).orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + id));
    }

    private void detectarRecurrencia(Incidencia incidencia) {
        if (incidencia.getHabitacion() != null && incidencia.getHabitacion().getIdHabitacion() != null
                && incidencia.getTipo() != null) {
            List<Incidencia> previas = incidenciaRepository
                    .findByHabitacion_IdHabitacionAndTipoAndEstadoIn(
                            incidencia.getHabitacion().getIdHabitacion(),
                            incidencia.getTipo(),
                            List.of("RESUELTO", "CERRADO"));
            if (!previas.isEmpty()) {
                incidencia.setEsRecurrente(true);
                Incidencia primera = previas.get(0);
                Incidencia root = primera;
                if (primera.getIncidenciaOriginal() != null) {
                    Optional<Incidencia> padre = incidenciaRepository.findById(
                            primera.getIncidenciaOriginal().getIdIncidencia());
                    if (padre.isPresent()) {
                        root = padre.get();
                    }
                }
                incidencia.setIncidenciaOriginal(root);
            }
        }
    }

    private void asignarPrioridad(Incidencia incidencia) {
        int nivel = 2;
        if (incidencia.getArea() != null && incidencia.getArea().getIdArea() != null) {
            Optional<Area> areaOpt = areaRepository.findById(incidencia.getArea().getIdArea());
            if (areaOpt.isPresent()) {
                nivel = areaOpt.get().getNivelPrioridad();
            }
        }
        if (Boolean.TRUE.equals(incidencia.getEsRecurrente())) {
            nivel = Math.min(nivel + 1, 4);
        }
        String desc = incidencia.getDescripcion();
        if (desc != null) {
            String[] keywords = {"QUEJA", "CLIENTE", "CANCELACION", "URGENTE"};
            for (String kw : keywords) {
                if (desc.contains(kw)) {
                    nivel = Math.min(nivel + 1, 4);
                    break;
                }
            }
        }
        incidencia.setPrioridad(switch (nivel) {
            case 1 -> "BAJA";
            case 2 -> "MEDIA";
            case 3 -> "ALTA";
            case 4 -> "URGENTE";
            default -> "MEDIA";
        });
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }
}
