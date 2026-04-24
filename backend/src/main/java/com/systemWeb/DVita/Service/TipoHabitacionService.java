package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.TipoHabitacion;
import main.java.com.systemWeb.DVita.Repository.TipoHabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class TipoHabitacionService {
    private final TipoHabitacionRepository tipoHabitacionRepository;

    public List<TipoHabitacion> listarTodos() {
        return tipoHabitacionRepository.findAll();
    }

    public Optional<TipoHabitacion> buscarPorId(Long id) {
        return tipoHabitacionRepository.findById(id);
    }

    public TipoHabitacion guardar(TipoHabitacion tipoHabitacion) {
        return tipoHabitacionRepository.save(tipoHabitacion);
    }

    public TipoHabitacion actualizar(Long id, TipoHabitacion tipoActualizado) {
        return tipoHabitacionRepository.findById(id).map(tipo -> {
            tipo.setDescripcion(tipoActualizado.getDescripcion());
            tipo.setPrecio(tipoActualizado.getPrecio());
            return tipoHabitacionRepository.save(tipo);
        }).orElseThrow(() -> new RuntimeException("TipoHabitacion no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        tipoHabitacionRepository.deleteById(id);
    }
}
