package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Permisos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository

public interface PermisosRepository extends JpaRepository<Permisos, Long> {
    List<Permisos> findByUsuario_IdUsuario(Long idUsuario);
    Optional<Permisos> findByUsuario_IdUsuarioAndModulo(Long idUsuario, String modulo);
}
