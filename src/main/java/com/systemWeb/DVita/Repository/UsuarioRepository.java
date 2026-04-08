package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface UsuarioRepository extends JpaRepository<Long, Usuario> {
}
