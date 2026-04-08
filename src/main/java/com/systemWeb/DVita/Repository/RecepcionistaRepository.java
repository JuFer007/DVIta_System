package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface RecepcionistaRepository extends JpaRepository<Long, Recepcionista> {
}
