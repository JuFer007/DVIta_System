package main.java.com.systemWeb.DVita.Repository;
import main.java.com.systemWeb.DVita.Model.Habitacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    
    Page<Habitacion> findAll(Pageable pageable);
    
    @Query("SELECT h FROM Habitacion h WHERE " +
           "(:estado IS NULL OR h.estado = :estado) AND " +
           "(:idTipoHabitacion IS NULL OR h.tipoHabitacion.idTipoHabitacion = :idTipoHabitacion) AND " +
           "(:numeroHabitacion IS NULL OR h.numeroHabitacion = :numeroHabitacion) AND " +
           "(:precioMin IS NULL OR h.precio >= :precioMin) AND " +
           "(:precioMax IS NULL OR h.precio <= :precioMax)")
    Page<Habitacion> buscarConFiltros(
            @Param("estado") String estado,
            @Param("idTipoHabitacion") Long idTipoHabitacion,
            @Param("numeroHabitacion") Integer numeroHabitacion,
            @Param("precioMin") java.math.BigDecimal precioMin,
            @Param("precioMax") java.math.BigDecimal precioMax,
            Pageable pageable
    );
    
    boolean existsByNumeroHabitacion(Integer numeroHabitacion);
    
    boolean existsByNumeroHabitacionAndIdHabitacionNot(Integer numeroHabitacion, Long idHabitacion);
}
