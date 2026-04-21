package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;

    public List<Horario> listarTodos() {
        return horarioRepository.findAll();
    }

    public Optional<Horario> buscarPorId(Long id) {
        return horarioRepository.findById(id);
    }

    public List<Horario> listarPorRecepcionista(Long idRecepcionista) {
        return horarioRepository.findByRecepcionista_IdRecepcionista(idRecepcionista);
    }

    public List<Horario> listarPorRecepcionistaYRango(Long idRecepcionista, LocalDate desde, LocalDate hasta) {
        return horarioRepository.findByRecepcionistaAndFechaBetween(idRecepcionista, desde, hasta);
    }

    public List<Horario> listarPorFecha(LocalDate fecha) {
        return horarioRepository.findByFechaOrderByHoraInicio(fecha);
    }

    public List<Horario> listarEnCurso() {
        return horarioRepository.findByEstado("EN_CURSO");
    }

    public Horario guardar(Horario horario) {
        aplicarHorasPorTurno(horario);
        return horarioRepository.save(horario);
    }

    public Horario actualizar(Long id, Horario horarioActualizado) {
        return horarioRepository.findById(id).map(horario -> {
            horario.setRecepcionista(horarioActualizado.getRecepcionista());
            horario.setFecha(horarioActualizado.getFecha());
            horario.setTipoTurno(horarioActualizado.getTipoTurno());
            aplicarHorasPorTurno(horario);
            if ("PERSONALIZADO".equals(horarioActualizado.getTipoTurno())) {
                horario.setHoraInicio(horarioActualizado.getHoraInicio());
                horario.setHoraFin(horarioActualizado.getHoraFin());
            }
            horario.setEstado(horarioActualizado.getEstado());
            horario.setObservaciones(horarioActualizado.getObservaciones());
            return horarioRepository.save(horario);
        }).orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
    }

    public Horario cambiarEstado(Long id, String nuevoEstado) {
        return horarioRepository.findById(id).map(horario -> {
            horario.setEstado(nuevoEstado);
            return horarioRepository.save(horario);
        }).orElseThrow(() -> new RuntimeException("Horario no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        horarioRepository.deleteById(id);
    }

    private void aplicarHorasPorTurno(Horario horario) {
        if (horario.getTipoTurno() == null) return;
        switch (horario.getTipoTurno()) {
            case "MAÑANA" -> {
                horario.setHoraInicio(java.time.LocalTime.of(6,  0));
                horario.setHoraFin(   java.time.LocalTime.of(14, 0));
            }
            case "TARDE" -> {
                horario.setHoraInicio(java.time.LocalTime.of(14, 0));
                horario.setHoraFin(   java.time.LocalTime.of(22, 0));
            }
            case "NOCHE" -> {
                horario.setHoraInicio(java.time.LocalTime.of(22, 0));
                horario.setHoraFin(   java.time.LocalTime.of(6,  0));
            }
        }
    }
}
