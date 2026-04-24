package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.Cliente;
import main.java.com.systemWeb.DVita.Repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class ClienteService {
    private final ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> buscarPorId(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente guardar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente clienteActualizado) {
        return clienteRepository.findById(id).map(cliente -> {
            cliente.setNombre(clienteActualizado.getNombre());
            cliente.setApellidoPaterno(clienteActualizado.getApellidoPaterno());
            cliente.setApellidoMaterno(clienteActualizado.getApellidoMaterno());
            cliente.setDni(clienteActualizado.getDni());
            cliente.setTelefono(clienteActualizado.getTelefono());
            cliente.setEmail(clienteActualizado.getEmail());
            return clienteRepository.save(cliente);
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }
}
