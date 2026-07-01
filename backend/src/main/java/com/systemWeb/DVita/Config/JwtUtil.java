package com.systemWeb.DVita.Config;
import com.systemWeb.DVita.Model.Permisos;
import com.systemWeb.DVita.Model.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component

public class JwtUtil {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long expiration) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String generateToken(Usuario usuario) {
        String nombre = usuario.getEmpleado() != null
                ? (usuario.getEmpleado().getNombre() + " " + usuario.getEmpleado().getApellidoP()).trim()
                : "Usuario";

        Map<String, Object> permisosMap = new HashMap<>();
        if (usuario.getPermisos() != null) {
            for (Permisos p : usuario.getPermisos()) {
                permisosMap.put(p.getModulo(), Boolean.TRUE.equals(p.getPuedeAcceder()));
            }
        }

        Long idEmpleado = usuario.getEmpleado() != null ? usuario.getEmpleado().getIdEmpleado() : null;

        return Jwts.builder()
                .subject(usuario.getNombreUsuario())
                .claim("idUsuario", usuario.getIdUsuario())
                .claim("nombre", nombre)
                .claim("idEmpleado", idEmpleado)
                .claim("permisos", permisosMap)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Map<String, Boolean> extractPermisos(String token) {
        Object raw = extractAllClaims(token).get("permisos");
        if (raw instanceof Map) {
            Map<String, Object> rawMap = (Map<String, Object>) raw;
            Map<String, Boolean> result = new HashMap<>();
            for (Map.Entry<String, Object> entry : rawMap.entrySet()) {
                result.put(entry.getKey(), Boolean.TRUE.equals(entry.getValue()));
            }
            return result;
        }
        return Collections.emptyMap();
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
