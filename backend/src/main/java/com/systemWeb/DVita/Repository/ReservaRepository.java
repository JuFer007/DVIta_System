package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
}
