package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setEmpleado(usuarioActualizado.getEmpleado());
            usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
            usuario.setContrasena(usuarioActualizado.getContrasena());
            return usuarioRepository.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }
}
