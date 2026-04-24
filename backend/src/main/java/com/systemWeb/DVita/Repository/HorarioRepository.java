package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByRecepcionista_IdRecepcionista(Long idRecepcionista);
    @Query("SELECT h FROM Horario h WHERE h.recepcionista.idRecepcionista = :idRecep AND h.fecha BETWEEN :desde AND :hasta ORDER BY h.fecha, h.horaInicio")
    List<Horario> findByRecepcionistaAndFechaBetween(@Param("idRecep") Long idRecepcionista, @Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
    List<Horario> findByFechaOrderByHoraInicio(LocalDate fecha);
    List<Horario> findByEstado(String estado);
}
