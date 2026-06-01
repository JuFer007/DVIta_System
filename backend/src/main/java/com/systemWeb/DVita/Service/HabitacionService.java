<<<<<<< HEAD
package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.DTO.HabitacionDTO;
import main.java.com.systemWeb.DVita.DTO.HabitacionRequestDTO;
import main.java.com.systemWeb.DVita.Exception.RecursoDuplicadoException;
import main.java.com.systemWeb.DVita.Exception.RecursoNoEncontradoException;
import main.java.com.systemWeb.DVita.Model.Habitacion;
import main.java.com.systemWeb.DVita.Model.TipoHabitacion;
import main.java.com.systemWeb.DVita.Repository.HabitacionRepository;
import main.java.com.systemWeb.DVita.Repository.TipoHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
=======
package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Repository.HabitacionRepository;
import com.systemWeb.DVita.Repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
>>>>>>> main
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class HabitacionService {
    private final HabitacionRepository habitacionRepository;
<<<<<<< HEAD
    private final TipoHabitacionRepository tipoHabitacionRepository;
=======
    private final ReservaRepository reservaRepository;
>>>>>>> main

    public Page<HabitacionDTO> listarTodos(Pageable pageable) {
        return habitacionRepository.findAll(pageable)
                .map(this::convertirADTO);
    }

    public Page<HabitacionDTO> buscarConFiltros(String estado, Long idTipoHabitacion, 
            Integer numeroHabitacion, BigDecimal precioMin, BigDecimal precioMax, Pageable pageable) {
        return habitacionRepository.buscarConFiltros(estado, idTipoHabitacion, 
                numeroHabitacion, precioMin, precioMax, pageable)
                .map(this::convertirADTO);
    }

<<<<<<< HEAD
    public Optional<HabitacionDTO> buscarPorId(Long id) {
        return habitacionRepository.findById(id)
                .map(this::convertirADTO);
    }

    public HabitacionDTO guardar(HabitacionRequestDTO habitacionRequestDTO) {
        // Validar que el número de habitación no exista
        if (habitacionRepository.existsByNumeroHabitacion(habitacionRequestDTO.getNumeroHabitacion())) {
            throw new RecursoDuplicadoException("Ya existe una habitación con el número: " + habitacionRequestDTO.getNumeroHabitacion());
        }

        TipoHabitacion tipoHabitacion = tipoHabitacionRepository.findById(habitacionRequestDTO.getIdTipoHabitacion())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de habitación no encontrado con id: " + habitacionRequestDTO.getIdTipoHabitacion()));

        Habitacion habitacion = Habitacion.builder()
                .tipoHabitacion(tipoHabitacion)
                .numeroHabitacion(habitacionRequestDTO.getNumeroHabitacion())
                .estado(habitacionRequestDTO.getEstado())
                .precio(habitacionRequestDTO.getPrecio())
                .build();

        return convertirADTO(habitacionRepository.save(habitacion));
    }

    public HabitacionDTO actualizar(Long id, HabitacionRequestDTO habitacionRequestDTO) {
        Habitacion habitacion = habitacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Habitación no encontrada con id: " + id));

        // Validar que el número de habitación no exista en otra habitación
        if (habitacionRepository.existsByNumeroHabitacionAndIdHabitacionNot(
                habitacionRequestDTO.getNumeroHabitacion(), id)) {
            throw new RecursoDuplicadoException("Ya existe otra habitación con el número: " + habitacionRequestDTO.getNumeroHabitacion());
        }

        TipoHabitacion tipoHabitacion = tipoHabitacionRepository.findById(habitacionRequestDTO.getIdTipoHabitacion())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de habitación no encontrado con id: " + habitacionRequestDTO.getIdTipoHabitacion()));

        habitacion.setTipoHabitacion(tipoHabitacion);
        habitacion.setNumeroHabitacion(habitacionRequestDTO.getNumeroHabitacion());
        habitacion.setEstado(habitacionRequestDTO.getEstado());
        habitacion.setPrecio(habitacionRequestDTO.getPrecio());

        return convertirADTO(habitacionRepository.save(habitacion));
=======
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
>>>>>>> main
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    public void eliminar(Long id) {
<<<<<<< HEAD
        if (!habitacionRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Habitación no encontrada con id: " + id);
=======
        boolean tieneReservas = reservaRepository.findByHabitacionIdHabitacionAndEstadoReservaNot(id, "CANCELADA")
                .stream().anyMatch(r -> r.getFechaSalida().isAfter(LocalDate.now()) || r.getFechaIngreso().isAfter(LocalDate.now()));
        if (tieneReservas) {
            throw new IllegalStateException("No se puede eliminar la habitación porque tiene reservas activas o futuras");
>>>>>>> main
        }
        habitacionRepository.deleteById(id);
    }

<<<<<<< HEAD
    private HabitacionDTO convertirADTO(Habitacion habitacion) {
        return HabitacionDTO.builder()
                .idHabitacion(habitacion.getIdHabitacion())
                .idTipoHabitacion(habitacion.getTipoHabitacion().getIdTipoHabitacion())
                .tipoDescripcion(habitacion.getTipoHabitacion().getDescripcion())
                .numeroHabitacion(habitacion.getNumeroHabitacion())
                .estado(habitacion.getEstado())
                .precio(habitacion.getPrecio())
                .build();
=======
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
>>>>>>> main
    }
}
