package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface PagoRepository extends JpaRepository<Pago, Long> {
}
