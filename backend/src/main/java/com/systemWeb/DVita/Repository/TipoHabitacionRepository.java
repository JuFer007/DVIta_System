package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.TipoHabitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface TipoHabitacionRepository extends JpaRepository<TipoHabitacion, Long> {
}
