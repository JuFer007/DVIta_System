package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ReservaRepository extends JpaRepository<Long, Reserva> {
}
