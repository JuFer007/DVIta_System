package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.Recepcionista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface RecepcionistaRepository extends JpaRepository<Recepcionista, Long> {
}
