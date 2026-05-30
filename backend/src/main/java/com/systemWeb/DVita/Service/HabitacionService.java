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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class HabitacionService {
    private final HabitacionRepository habitacionRepository;
    private final TipoHabitacionRepository tipoHabitacionRepository;

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
    }

    public void eliminar(Long id) {
        if (!habitacionRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Habitación no encontrada con id: " + id);
        }
        habitacionRepository.deleteById(id);
    }

    private HabitacionDTO convertirADTO(Habitacion habitacion) {
        return HabitacionDTO.builder()
                .idHabitacion(habitacion.getIdHabitacion())
                .idTipoHabitacion(habitacion.getTipoHabitacion().getIdTipoHabitacion())
                .tipoDescripcion(habitacion.getTipoHabitacion().getDescripcion())
                .numeroHabitacion(habitacion.getNumeroHabitacion())
                .estado(habitacion.getEstado())
                .precio(habitacion.getPrecio())
                .build();
    }
}
