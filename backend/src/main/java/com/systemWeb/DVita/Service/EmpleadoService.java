package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
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
        empleado.setNombre(  upper(empleado.getNombre()));
        empleado.setApellidoP(upper(empleado.getApellidoP()));
        empleado.setApellidoM(upper(empleado.getApellidoM()));
        empleado.setDni(     upper(empleado.getDni()));
        empleado.setTelefono(upper(empleado.getTelefono()));
        return empleadoRepository.save(empleado);
    }

    public Empleado actualizar(Long id, Empleado empleadoActualizado) {
        return empleadoRepository.findById(id).map(empleado -> {
            empleado.setNombre(  upper(empleadoActualizado.getNombre()));
            empleado.setApellidoP(upper(empleadoActualizado.getApellidoP()));
            empleado.setApellidoM(upper(empleadoActualizado.getApellidoM()));
            empleado.setDni(     upper(empleadoActualizado.getDni()));
            empleado.setTelefono(upper(empleadoActualizado.getTelefono()));
            return empleadoRepository.save(empleado);
        }).orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    public void eliminar(Long id) {
        empleadoRepository.deleteById(id);
    }
}
