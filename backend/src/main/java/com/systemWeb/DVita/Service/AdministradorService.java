package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Administrador;
import com.systemWeb.DVita.Repository.AdministradorRepository;
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
        administrador.setCorreoElectronico(upper(administrador.getCorreoElectronico()));
        return administradorRepository.save(administrador);
    }

    public Administrador actualizar(Long id, Administrador adminActualizado) {
        return administradorRepository.findById(id).map(admin -> {
            admin.setEmpleado(adminActualizado.getEmpleado());
            admin.setCorreoElectronico(upper(adminActualizado.getCorreoElectronico()));
            return administradorRepository.save(admin);
        }).orElseThrow(() -> new RuntimeException("Administrador no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }


}
