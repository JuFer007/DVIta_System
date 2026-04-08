package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface HabitacionRepository extends JpaRepository<Long, Habitacion> {
}
