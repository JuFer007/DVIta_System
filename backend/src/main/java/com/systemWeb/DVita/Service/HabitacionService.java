package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Repository.HabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class HabitacionService {
    private final HabitacionRepository habitacionRepository;

    public List<Habitacion> listarTodos() {
        return habitacionRepository.findAll();
    }

    public Optional<Habitacion> buscarPorId(Long id) {
        return habitacionRepository.findById(id);
    }

    public Habitacion guardar(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    public Habitacion actualizar(Long id, Habitacion habitacionActualizada) {
        return habitacionRepository.findById(id).map(habitacion -> {
            habitacion.setTipoHabitacion(habitacionActualizada.getTipoHabitacion());
            habitacion.setNumeroHabitacion(habitacionActualizada.getNumeroHabitacion());
            habitacion.setEstado(habitacionActualizada.getEstado());
            habitacion.setPrecio(habitacionActualizada.getPrecio());
            return habitacionRepository.save(habitacion);
        }).orElseThrow(() -> new RuntimeException("Habitacion no encontrada con id: " + id));
    }

    public void eliminar(Long id) {
        habitacionRepository.deleteById(id);
    }
}
