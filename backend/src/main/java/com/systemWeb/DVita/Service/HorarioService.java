package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Model.enums.CargoEmpleado;
import com.systemWeb.DVita.Model.enums.EstadoHorario;
import com.systemWeb.DVita.Model.enums.TipoTurno;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import com.systemWeb.DVita.Repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final EmpleadoRepository empleadoRepository;

    public List<Horario> listarTodos() {
        return horarioRepository.findAll();
    }

    public Optional<Horario> buscarPorId(Long id) {
        return horarioRepository.findById(id);
    }

    public List<Horario> listarPorEmpleado(Long idEmpleado) {
        return horarioRepository.findByEmpleado_IdEmpleado(idEmpleado);
    }

    public Horario guardar(Horario horario) {
        validarSinCruces(horario);
        horario.setDiaSemana(horario.getDiaSemana().toUpperCase());
        if (horario.getTipoTurno() != null && (horario.getHoraInicio() == null || horario.getHoraFin() == null)) {
            aplicarHorasPorTurno(horario);
        }
        horario.setObservaciones(upper(horario.getObservaciones()));
        return horarioRepository.save(horario);
    }

    public Horario actualizar(Long id, Horario horarioActualizado) {
        return horarioRepository.findById(id).map(horario -> {
            validarSinCruces(horarioActualizado, id);
            horario.setEmpleado(horarioActualizado.getEmpleado());
            horario.setDiaSemana(horarioActualizado.getDiaSemana().toUpperCase());
            horario.setHoraInicio(horarioActualizado.getHoraInicio());
            horario.setHoraFin(horarioActualizado.getHoraFin());
            horario.setTipoTurno(horarioActualizado.getTipoTurno());
            horario.setEstado(horarioActualizado.getEstado());
            horario.setObservaciones(upper(horarioActualizado.getObservaciones()));
            return horarioRepository.save(horario);
        }).orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        if (!horarioRepository.existsById(id)) {
            throw new RuntimeException("Horario no encontrado con id: " + id);
        }
        horarioRepository.deleteById(id);
    }

    public Horario cambiarEstado(Long id, EstadoHorario nuevoEstado) {
        return horarioRepository.findById(id).map(horario -> {
            horario.setEstado(nuevoEstado);
            return horarioRepository.save(horario);
        }).orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
    }

    public Map<String, Object> verificarAcceso(Long idEmpleado) {
        Optional<Empleado> optEmp = empleadoRepository.findById(idEmpleado);
        if (optEmp.isEmpty()) {
            return Map.of("acceso", false, "mensaje", "Empleado no encontrado.");
        }
        Empleado emp = optEmp.get();
        if (emp.getCargo() == CargoEmpleado.ADMINISTRADOR || emp.getCargo() == CargoEmpleado.GERENTE) {
            return Map.of("acceso", true, "mensaje", "Acceso permitido.");
        }
        String diaSemana = LocalDate.now().getDayOfWeek()
                .getDisplayName(TextStyle.FULL, new Locale("es", "ES"))
                .toUpperCase();
        LocalTime ahora = LocalTime.now();
        List<Horario> horarios = horarioRepository
                .findByEmpleado_IdEmpleadoAndDiaSemanaAndEstadoIn(
                        idEmpleado, diaSemana,
                        List.of(EstadoHorario.PROGRAMADO, EstadoHorario.EN_CURSO));
        for (Horario h : horarios) {
            LocalTime inicio = h.getHoraInicio();
            LocalTime fin = h.getHoraFin();
            if (inicio == null || fin == null) continue;
            if (inicio.isBefore(fin)) {
                if (!ahora.isBefore(inicio) && ahora.isBefore(fin)) {
                    return Map.of("acceso", true, "mensaje", "Acceso permitido.");
                }
            } else {
                if (!ahora.isBefore(inicio) || ahora.isBefore(fin)) {
                    return Map.of("acceso", true, "mensaje", "Acceso permitido.");
                }
            }
        }
        return Map.of("acceso", false, "mensaje",
                "No tienes un horario activo en este momento. Accede solo dentro de tu turno programado.");
    }

    private void validarSinCruces(Horario h) {
        validarSinCruces(h, null);
    }

    private void validarSinCruces(Horario h, Long excluirId) {
        if (h.getHoraInicio() == null || h.getHoraFin() == null) return;
        List<Horario> existentes = horarioRepository
                .findByEmpleado_IdEmpleadoAndDiaSemana(
                        h.getEmpleado().getIdEmpleado(), h.getDiaSemana().toUpperCase());
        for (Horario e : existentes) {
            if (excluirId != null && e.getIdHorario().equals(excluirId)) continue;
            if (e.getHoraInicio() == null || e.getHoraFin() == null) continue;
            if (horasSeCruzan(h.getHoraInicio(), h.getHoraFin(), e.getHoraInicio(), e.getHoraFin())) {
                throw new RuntimeException(
                    "El horario se cruza con otro existente: " + e.getHoraInicio() + " - " + e.getHoraFin()
                );
            }
        }
    }

    private boolean horasSeCruzan(LocalTime ini1, LocalTime fin1, LocalTime ini2, LocalTime fin2) {
        if (fin1.isBefore(ini1)) fin1 = fin1.plusHours(24);
        if (fin2.isBefore(ini2)) fin2 = fin2.plusHours(24);
        return ini1.isBefore(fin2) && ini2.isBefore(fin1);
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    private void aplicarHorasPorTurno(Horario horario) {
        if (horario.getTipoTurno() == null) return;
        switch (horario.getTipoTurno()) {
            case MAÑANA -> {
                horario.setHoraInicio(LocalTime.of(6,  0));
                horario.setHoraFin(   LocalTime.of(14, 0));
            }
            case TARDE -> {
                horario.setHoraInicio(LocalTime.of(14, 0));
                horario.setHoraFin(   LocalTime.of(22, 0));
            }
            case NOCHE -> {
                horario.setHoraInicio(LocalTime.of(22, 0));
                horario.setHoraFin(   LocalTime.of(6,  0));
            }
        }
    }
}
