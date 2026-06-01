package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PermisosService moduloPermisoService;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        usuario.setNombreUsuario(lower(usuario.getNombreUsuario()));
        Usuario saved = usuarioRepository.save(usuario);
        moduloPermisoService.inicializarPermisos(saved);
        return saved;
    }

    @Transactional
    public Usuario crearDesdeEmpleado(Empleado empleado) {
        String username = lower(empleado.getNombre().charAt(0) + empleado.getApellidoP());
        Usuario usuario = Usuario.builder()
                .empleado(empleado)
                .nombreUsuario(username)
                .contrasena("123456")
                .build();
        return guardar(usuario);
    }

    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setEmpleado(usuarioActualizado.getEmpleado());
            usuario.setNombreUsuario(lower(usuarioActualizado.getNombreUsuario()));
            if (usuarioActualizado.getContrasena() != null && !usuarioActualizado.getContrasena().isBlank()) {
                usuario.setContrasena(usuarioActualizado.getContrasena());
            }
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public Usuario toggleActivo(Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setActivo(!usuario.getActivo());
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public void toggleActivoPorEmpleado(Long idEmpleado) {
        usuarioRepository.findByEmpleadoIdEmpleado(idEmpleado).ifPresent(usuario -> {
            usuario.setActivo(!usuario.getActivo());
            usuarioRepository.save(usuario);
        });
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }

    private static String lower(String s) {
        return s != null ? s.toLowerCase().trim() : null;
    }
}
