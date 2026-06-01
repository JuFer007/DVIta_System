package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class EmpleadoService {
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioService usuarioService;

    public List<Empleado> listarTodos() {
        return empleadoRepository.findAll();
    }

    public Optional<Empleado> buscarPorId(Long id) {
        return empleadoRepository.findById(id);
    }

    @Transactional
    public Empleado guardar(Empleado empleado) {
        empleado.setNombre(  upper(empleado.getNombre()));
        empleado.setApellidoP(upper(empleado.getApellidoP()));
        empleado.setApellidoM(upper(empleado.getApellidoM()));
        empleado.setDni(     upper(empleado.getDni()));
        empleado.setTelefono(upper(empleado.getTelefono()));
        Empleado saved = empleadoRepository.save(empleado);
        usuarioService.crearDesdeEmpleado(saved);
        return saved;
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

    public Empleado toggleActivo(Long id) {
        return empleadoRepository.findById(id).map(empleado -> {
            empleado.setActivo(!empleado.getActivo());
            Empleado saved = empleadoRepository.save(empleado);
            usuarioService.toggleActivoPorEmpleado(id);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Empleado no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }


}
