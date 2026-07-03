package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Area;
import com.systemWeb.DVita.Model.Cliente;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import com.systemWeb.DVita.Model.enums.EstadoIncidencia;
import com.systemWeb.DVita.Model.enums.Prioridad;
import com.systemWeb.DVita.Model.enums.TipoIncidencia;
import com.systemWeb.DVita.Repository.AreaRepository;
import com.systemWeb.DVita.Repository.ClienteRepository;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import com.systemWeb.DVita.Repository.HabitacionRepository;
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
    private final ClienteRepository clienteRepository;
    private final HabitacionRepository habitacionRepository;
    private final IncidenciaResolucionRepository incidenciaResolucionRepository;

    public List<Incidencia> listarTodos() {
        return incidenciaRepository.findAll();
    }

    public Optional<Incidencia> buscarPorId(Long id) {
        return incidenciaRepository.findById(id);
    }

    public List<Incidencia> listarPorEstado(String estado) {
        return incidenciaRepository.findByEstado(EstadoIncidencia.valueOf(estado.toUpperCase().trim()));
    }

    public List<Incidencia> listarPorPrioridad(String prioridad) {
        return incidenciaRepository.findByPrioridad(Prioridad.valueOf(prioridad.toUpperCase().trim()));
    }

    public List<Incidencia> listarRecurrentes(Long idHabitacion, String tipo) {
        return incidenciaRepository.findByHabitacion_IdHabitacionAndTipoAndEstadoIn(
                idHabitacion, TipoIncidencia.valueOf(tipo.toUpperCase().trim()),
                List.of(EstadoIncidencia.RESUELTO, EstadoIncidencia.CERRADO));
    }

    @Transactional
    public Incidencia guardar(Incidencia incidencia) {
        if (incidencia.getEmpleadoRegistra() != null && incidencia.getEmpleadoRegistra().getIdEmpleado() != null) {
            incidencia.setEmpleadoRegistra(empleadoRepository.getReferenceById(incidencia.getEmpleadoRegistra().getIdEmpleado()));
        } else {
            incidencia.setEmpleadoRegistra(empleadoRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay empleados registrados para asignar la incidencia")));
        }
        if (incidencia.getArea() != null && incidencia.getArea().getIdArea() != null) {
            incidencia.setArea(areaRepository.getReferenceById(incidencia.getArea().getIdArea()));
        }
        if (incidencia.getCliente() != null && incidencia.getCliente().getIdCliente() != null) {
            incidencia.setCliente(clienteRepository.getReferenceById(incidencia.getCliente().getIdCliente()));
        }
        if (incidencia.getHabitacion() != null && incidencia.getHabitacion().getIdHabitacion() != null) {
            incidencia.setHabitacion(habitacionRepository.getReferenceById(incidencia.getHabitacion().getIdHabitacion()));
        }
        incidencia.setDescripcion(upper(incidencia.getDescripcion()));
        incidencia.setNotasInternas(upper(incidencia.getNotasInternas()));

        detectarRecurrencia(incidencia);
        asignarPrioridad(incidencia);

        return incidenciaRepository.save(incidencia);
    }

    @Transactional
    public Incidencia actualizar(Long id, Incidencia incidenciaActualizada) {
        return incidenciaRepository.findById(id).map(incidencia -> {
            if (incidenciaActualizada.getEmpleadoRegistra() != null && incidenciaActualizada.getEmpleadoRegistra().getIdEmpleado() != null) {
                incidencia.setEmpleadoRegistra(empleadoRepository.getReferenceById(incidenciaActualizada.getEmpleadoRegistra().getIdEmpleado()));
            }
            if (incidenciaActualizada.getCliente() != null && incidenciaActualizada.getCliente().getIdCliente() != null) {
                incidencia.setCliente(clienteRepository.getReferenceById(incidenciaActualizada.getCliente().getIdCliente()));
            } else {
                incidencia.setCliente(null);
            }
            if (incidenciaActualizada.getHabitacion() != null && incidenciaActualizada.getHabitacion().getIdHabitacion() != null) {
                incidencia.setHabitacion(habitacionRepository.getReferenceById(incidenciaActualizada.getHabitacion().getIdHabitacion()));
            } else {
                incidencia.setHabitacion(null);
            }
            if (incidenciaActualizada.getArea() != null && incidenciaActualizada.getArea().getIdArea() != null) {
                incidencia.setArea(areaRepository.getReferenceById(incidenciaActualizada.getArea().getIdArea()));
            } else {
                incidencia.setArea(null);
            }
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
    public Incidencia cambiarEstado(Long id, EstadoIncidencia nuevoEstado, String solucion, String notasAuditoria, Long idEmpleadoResuelve) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada con id: " + id));
        incidencia = incidenciaRepository.save(incidencia);

        incidencia.setEstado(nuevoEstado);
        if (EstadoIncidencia.RESUELTO == nuevoEstado) {
            incidencia.setFechaResolucion(LocalDate.now());

            int veces = incidencia.getVecesResuelta() != null ? incidencia.getVecesResuelta() : 0;
            IncidenciaResolucion resolucion = IncidenciaResolucion.builder()
                    .incidencia(incidencia)
                    .version(veces + 1)
                    .fechaResolucion(LocalDate.now())
                    .solucion(upper(solucion))
                    .notasAuditoria(upper(notasAuditoria))
                    .build();
            if (idEmpleadoResuelve != null) {
                resolucion.setEmpleadoResuelve(empleadoRepository.getReferenceById(idEmpleadoResuelve));
            }
            incidenciaResolucionRepository.save(resolucion);

            incidencia.setVecesResuelta(veces + 1);
        }
        if (EstadoIncidencia.CERRADO == nuevoEstado) {
            if (incidencia.getFechaResolucion() == null) {
                incidencia.setFechaResolucion(LocalDate.now());
            }
        }
        return incidenciaRepository.save(incidencia);
    }

    private void detectarRecurrencia(Incidencia incidencia) {
        if (incidencia.getHabitacion() != null && incidencia.getHabitacion().getIdHabitacion() != null
                && incidencia.getTipo() != null) {
            List<Incidencia> previas = incidenciaRepository
                    .findByHabitacion_IdHabitacionAndTipoAndEstadoIn(
                            incidencia.getHabitacion().getIdHabitacion(),
                            incidencia.getTipo(),
                            List.of(EstadoIncidencia.RESUELTO, EstadoIncidencia.CERRADO));
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
            case 1 -> Prioridad.BAJA;
            case 2 -> Prioridad.MEDIA;
            case 3 -> Prioridad.ALTA;
            case 4 -> Prioridad.URGENTE;
            default -> Prioridad.MEDIA;
        });
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }
}
