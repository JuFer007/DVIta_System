package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Permisos;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Repository.PermisosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor

public class PermisosService {
    private final PermisosRepository moduloPermisoRepository;

    public static final List<String> MODULOS = List.of(
        "CLIENTES", "EMPLEADOS", "HABITACIONES", "TIPOS_HABITACION",
        "RESERVAS", "PAGOS", "USUARIOS", "INCIDENCIAS"
    );

    public List<Permisos> listarPorUsuario(Long idUsuario) {
        return moduloPermisoRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public void inicializarPermisos(Usuario usuario) {
        for (String modulo : MODULOS) {
            Permisos permiso = Permisos.builder()
                    .usuario(usuario)
                    .modulo(modulo)
                    .puedeAcceder(true)
                    .build();
            moduloPermisoRepository.save(permiso);
        }
    }

    @Transactional
    public void actualizarPermisos(Long idUsuario, List<Permisos> permisos) {
        moduloPermisoRepository.findByUsuario_IdUsuario(idUsuario)
                .forEach(p -> moduloPermisoRepository.delete(p));
        for (Permisos p : permisos) {
            p.setIdModuloPermiso(null);
            moduloPermisoRepository.save(p);
        }
    }
}
