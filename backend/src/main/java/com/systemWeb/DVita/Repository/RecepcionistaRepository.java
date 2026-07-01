package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface RecepcionistaRepository extends JpaRepository<Recepcionista, Long> {
    Optional<Recepcionista> findByEmpleado_IdEmpleado(Long idEmpleado);
}
