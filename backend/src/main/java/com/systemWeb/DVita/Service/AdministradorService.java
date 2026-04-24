package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.Administrador;
import main.java.com.systemWeb.DVita.Repository.AdministradorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class AdministradorService {
    private final AdministradorRepository administradorRepository;

    public List<Administrador> listarTodos() {
        return administradorRepository.findAll();
    }

    public Optional<Administrador> buscarPorId(Long id) {
        return administradorRepository.findById(id);
    }

    public Administrador guardar(Administrador administrador) {
        return administradorRepository.save(administrador);
    }

    public Administrador actualizar(Long id, Administrador adminActualizado) {
        return administradorRepository.findById(id).map(admin -> {
            admin.setEmpleado(adminActualizado.getEmpleado());
            admin.setCorreoElectronico(adminActualizado.getCorreoElectronico());
            return administradorRepository.save(admin);
        }).orElseThrow(() -> new RuntimeException("Administrador no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        administradorRepository.deleteById(id);
    }
}
