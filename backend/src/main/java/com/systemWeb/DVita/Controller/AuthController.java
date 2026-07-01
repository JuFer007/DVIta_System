package com.systemWeb.DVita.Controller;
import com.systemWeb.DVita.DTO.LoginRequest;
import com.systemWeb.DVita.DTO.LoginResponse;
import com.systemWeb.DVita.Model.Permisos;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Repository.UsuarioRepository;
import com.systemWeb.DVita.Config.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.nombreUsuario(), request.contrasena()));

            Usuario usuario = usuarioRepository.findByNombreUsuario(request.nombreUsuario())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            if (!Boolean.TRUE.equals(usuario.getActivo())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Usuario inactivo. Contacta al administrador."));
            }

            String token = jwtUtil.generateToken(usuario);

            String nombre = usuario.getEmpleado() != null
                    ? (usuario.getEmpleado().getNombre() + " " + usuario.getEmpleado().getApellidoP()).trim()
                    : "Usuario";

            Long idEmpleado = usuario.getEmpleado() != null ? usuario.getEmpleado().getIdEmpleado() : null;

            String cargo = usuario.getEmpleado() != null && usuario.getEmpleado().getCargo() != null
                    ? usuario.getEmpleado().getCargo().name()
                    : "RECEPCIONISTA";

            Map<String, Boolean> permisosMap = new HashMap<>();
            if (usuario.getPermisos() != null) {
                for (Permisos p : usuario.getPermisos()) {
                    permisosMap.put(p.getModulo(), Boolean.TRUE.equals(p.getPuedeAcceder()));
                }
            }

            LoginResponse.UserData userData = new LoginResponse.UserData(
                    usuario.getIdUsuario(),
                    usuario.getNombreUsuario(),
                    nombre,
                    idEmpleado,
                    cargo,
                    permisosMap
            );

            return ResponseEntity.ok(new LoginResponse(token, userData));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuario o contraseña incorrectos"));
        }
    }
}
