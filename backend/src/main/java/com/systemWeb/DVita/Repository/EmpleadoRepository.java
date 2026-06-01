package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
}
