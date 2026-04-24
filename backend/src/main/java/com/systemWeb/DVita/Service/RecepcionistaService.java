package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.Recepcionista;
import main.java.com.systemWeb.DVita.Repository.RecepcionistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class RecepcionistaService {
    private final RecepcionistaRepository recepcionistaRepository;

    public List<Recepcionista> listarTodos() {
        return recepcionistaRepository.findAll();
    }

    public Optional<Recepcionista> buscarPorId(Long id) {
        return recepcionistaRepository.findById(id);
    }

    public Recepcionista guardar(Recepcionista recepcionista) {
        return recepcionistaRepository.save(recepcionista);
    }

    public Recepcionista actualizar(Long id, Recepcionista recepcionistaActualizado) {
        return recepcionistaRepository.findById(id).map(recepcionista -> {
            recepcionista.setEmpleado(recepcionistaActualizado.getEmpleado());
            recepcionista.setTurnoTrabajo(recepcionistaActualizado.getTurnoTrabajo());
            return recepcionistaRepository.save(recepcionista);
        }).orElseThrow(() -> new RuntimeException("Recepcionista no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        recepcionistaRepository.deleteById(id);
    }
}
