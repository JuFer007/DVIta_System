package com.systemWeb.DVita.DTO;
import java.util.Map;

public record LoginResponse(
        String token,
        UserData user
) {
    public record UserData(
            Long idUsuario,
            String nombreUsuario,
            String nombre,
            Long idEmpleado,
            String cargo,
            Map<String, Boolean> permisos
    ) {}
}
