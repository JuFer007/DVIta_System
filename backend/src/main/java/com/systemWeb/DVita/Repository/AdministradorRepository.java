package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
}
