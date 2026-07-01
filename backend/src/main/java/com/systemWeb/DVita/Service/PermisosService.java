package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Permisos;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Model.enums.CargoEmpleado;
import com.systemWeb.DVita.Repository.PermisosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor

public class PermisosService {
    private final PermisosRepository moduloPermisoRepository;

    public static final List<String> MODULOS = List.of(
        "CLIENTES", "EMPLEADOS", "HABITACIONES", "TIPOS_HABITACION",
        "RESERVAS", "PAGOS", "USUARIOS", "INCIDENCIAS"
    );

    private static final Map<CargoEmpleado, Set<String>> MODULOS_POR_CARGO = Map.of(
        CargoEmpleado.ADMINISTRADOR,  Set.copyOf(MODULOS),
        CargoEmpleado.GERENTE,        Set.of("CLIENTES", "EMPLEADOS", "HABITACIONES", "TIPOS_HABITACION", "RESERVAS", "PAGOS", "INCIDENCIAS"),
        CargoEmpleado.RECEPCIONISTA,  Set.of("CLIENTES", "HABITACIONES", "RESERVAS", "PAGOS"),
        CargoEmpleado.MANTENIMIENTO,  Set.of("HABITACIONES", "INCIDENCIAS"),
        CargoEmpleado.LIMPIEZA,       Set.of("HABITACIONES", "INCIDENCIAS"),
        CargoEmpleado.CHATBOT,        Set.of("INCIDENCIAS")
    );

    public List<Permisos> listarPorUsuario(Long idUsuario) {
        return moduloPermisoRepository.findByUsuario_IdUsuario(idUsuario);
    }

    @Transactional
    public void inicializarPermisos(Usuario usuario) {
        CargoEmpleado cargo = usuario.getEmpleado() != null && usuario.getEmpleado().getCargo() != null
                ? usuario.getEmpleado().getCargo()
                : CargoEmpleado.RECEPCIONISTA;
        Set<String> modulosPermitidos = MODULOS_POR_CARGO.getOrDefault(cargo, Set.of());
        for (String modulo : MODULOS) {
            Permisos permiso = Permisos.builder()
                    .usuario(usuario)
                    .modulo(modulo)
                    .puedeAcceder(modulosPermitidos.contains(modulo))
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
