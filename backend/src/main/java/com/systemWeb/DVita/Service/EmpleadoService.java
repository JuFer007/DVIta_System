package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.Empleado;
import main.java.com.systemWeb.DVita.Repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class EmpleadoService {
    private final EmpleadoRepository empleadoRepository;

    public List<Empleado> listarTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> buscarPorId(Long id) {
        return empleadoRepository.findById(id);
    }

    public Empleado guardar(Empleado empleado) {
        return empleadoRepository.save(empleado);
    }

    public Empleado actualizar(Long id, Empleado empleadoActualizado) {
        return empleadoRepository.findById(id).map(empleado -> {
            empleado.setNombre(empleadoActualizado.getNombre());
            empleado.setApellidoP(empleadoActualizado.getApellidoP());
            empleado.setApellidoM(empleadoActualizado.getApellidoM());
            empleado.setDni(empleadoActualizado.getDni());
            empleado.setTelefono(empleadoActualizado.getTelefono());
            return empleadoRepository.save(empleado);
        }).orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        empleadoRepository.deleteById(id);
    }
}
