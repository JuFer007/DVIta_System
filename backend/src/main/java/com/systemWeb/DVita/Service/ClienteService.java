package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Cliente;
import com.systemWeb.DVita.Repository.ClienteRepository;
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

    public Optional<Cliente> buscarPorDni(String dni) {
        return clienteRepository.findByDni(dni);
    }

    public Cliente guardar(Cliente cliente) {
        cliente.setNombre(     upper(cliente.getNombre()));
        cliente.setApellidoPaterno(upper(cliente.getApellidoPaterno()));
        cliente.setApellidoMaterno(upper(cliente.getApellidoMaterno()));
        cliente.setDni(        upper(cliente.getDni()));
        cliente.setTelefono(   upper(cliente.getTelefono()));
        cliente.setEmail(      upper(cliente.getEmail()));
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente clienteActualizado) {
        return clienteRepository.findById(id).map(cliente -> {
            cliente.setNombre(         upper(clienteActualizado.getNombre()));
            cliente.setApellidoPaterno(upper(clienteActualizado.getApellidoPaterno()));
            cliente.setApellidoMaterno(upper(clienteActualizado.getApellidoMaterno()));
            cliente.setDni(            upper(clienteActualizado.getDni()));
            cliente.setTelefono(       upper(clienteActualizado.getTelefono()));
            cliente.setEmail(          upper(clienteActualizado.getEmail()));
            return clienteRepository.save(cliente);
        }).orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }


}
