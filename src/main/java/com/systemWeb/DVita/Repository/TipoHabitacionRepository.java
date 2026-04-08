package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.TipoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface TipoHabitacionRepository extends JpaRepository<Long, TipoHabitacion> {
}
