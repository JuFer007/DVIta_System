package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Recepcionista;
import com.systemWeb.DVita.Repository.RecepcionistaRepository;
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
        recepcionista.setTurnoTrabajo(upper(recepcionista.getTurnoTrabajo()));
        return recepcionistaRepository.save(recepcionista);
    }

    public Recepcionista actualizar(Long id, Recepcionista recepcionistaActualizado) {
        return recepcionistaRepository.findById(id).map(recepcionista -> {
            recepcionista.setEmpleado(recepcionistaActualizado.getEmpleado());
            recepcionista.setTurnoTrabajo(upper(recepcionistaActualizado.getTurnoTrabajo()));
            return recepcionistaRepository.save(recepcionista);
        }).orElseThrow(() -> new RuntimeException("Recepcionista no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    public void eliminar(Long id) {
        recepcionistaRepository.deleteById(id);
    }
}
