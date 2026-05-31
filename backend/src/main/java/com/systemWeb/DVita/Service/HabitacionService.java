package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Repository.HabitacionRepository;
import com.systemWeb.DVita.Repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class HabitacionService {
    private final HabitacionRepository habitacionRepository;
    private final ReservaRepository reservaRepository;

    public List<Habitacion> listarTodos() {
        return habitacionRepository.findAll();
    }

    public Optional<Habitacion> buscarPorId(Long id) {
        return habitacionRepository.findById(id);
    }

    public Habitacion guardar(Habitacion habitacion) {
        habitacion.setEstado(upper(habitacion.getEstado()));
        return habitacionRepository.save(habitacion);
    }

    public Habitacion actualizar(Long id, Habitacion habitacionActualizada) {
        return habitacionRepository.findById(id).map(habitacion -> {
            habitacion.setTipoHabitacion(habitacionActualizada.getTipoHabitacion());
            habitacion.setNumeroHabitacion(habitacionActualizada.getNumeroHabitacion());
            habitacion.setEstado(upper(habitacionActualizada.getEstado()));
            return habitacionRepository.save(habitacion);
        }).orElseThrow(() -> new RuntimeException("Habitacion no encontrada con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    public void eliminar(Long id) {
        boolean tieneReservas = reservaRepository.findByHabitacionIdHabitacionAndEstadoReservaNot(id, "CANCELADA")
                .stream().anyMatch(r -> r.getFechaSalida().isAfter(LocalDate.now()) || r.getFechaIngreso().isAfter(LocalDate.now()));
        if (tieneReservas) {
            throw new IllegalStateException("No se puede eliminar la habitación porque tiene reservas activas o futuras");
        }
        habitacionRepository.deleteById(id);
    }

    @Transactional
    public Habitacion cambiarEstado(Long id, String nuevoEstado) {
        return habitacionRepository.findById(id).map(habitacion -> {
            String actual = habitacion.getEstado();

            if ("MANTENIMIENTO".equals(nuevoEstado) && !"DISPONIBLE".equals(actual)) {
                throw new IllegalStateException("Solo se puede poner en mantenimiento una habitación disponible");
            }
            if ("DISPONIBLE".equals(nuevoEstado) && !"MANTENIMIENTO".equals(actual)) {
                throw new IllegalStateException("Solo se puede habilitar una habitación que estaba en mantenimiento");
            }

            habitacion.setEstado(nuevoEstado);
            return habitacionRepository.save(habitacion);
        }).orElseThrow(() -> new RuntimeException("Habitacion no encontrada con id: " + id));
    }

    public List<Habitacion> habitacionesDisponibles(LocalDate ingreso, LocalDate salida) {
        return habitacionRepository.findHabitacionesDisponibles(ingreso, salida);
    }

    public List<Habitacion> disponiblesPorTipo(Long tipoId, LocalDate ingreso, LocalDate salida) {
        return habitacionRepository.findDisponiblesByTipo(tipoId, ingreso, salida);
    }

    @Transactional
    @Scheduled(cron = "0 0 6 * * ?")
    public void autoHabilitarMantenimiento() {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(1);
        List<Habitacion> habitaciones = habitacionRepository.findMantenimientoConReservaProxima(hoy, limite);
        for (Habitacion h : habitaciones) {
            h.setEstado("DISPONIBLE");
            habitacionRepository.save(h);
        }
    }
}
