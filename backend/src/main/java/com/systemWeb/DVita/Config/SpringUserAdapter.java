package com.systemWeb.DVita.Config;
import com.systemWeb.DVita.Model.Usuario;
import com.systemWeb.DVita.Model.enums.CargoEmpleado;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class SpringUserAdapter implements UserDetails {

    private final Usuario usuario;

    public SpringUserAdapter(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (usuario.getPermisos() != null) {
            for (var p : usuario.getPermisos()) {
                if (Boolean.TRUE.equals(p.getPuedeAcceder())) {
                    authorities.add(new SimpleGrantedAuthority("MODULO_" + p.getModulo()));
                }
            }
        }
        CargoEmpleado cargo = usuario.getEmpleado() != null ? usuario.getEmpleado().getCargo() : null;
        if (cargo != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + cargo.name()));
        } else {
            authorities.add(new SimpleGrantedAuthority("ROLE_RECEPCIONISTA"));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return usuario.getContrasena();
    }

    @Override
    public String getUsername() {
        return usuario.getNombreUsuario();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(usuario.getActivo());
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
