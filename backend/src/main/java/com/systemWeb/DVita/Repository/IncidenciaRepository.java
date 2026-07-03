package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Incidencia;
import com.systemWeb.DVita.Model.enums.EstadoIncidencia;
import com.systemWeb.DVita.Model.enums.Prioridad;
import com.systemWeb.DVita.Model.enums.TipoIncidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByEstado(EstadoIncidencia estado);
    List<Incidencia> findByPrioridad(Prioridad prioridad);
    List<Incidencia> findByEmpleadoRegistra_IdEmpleado(Long idEmpleado);
    List<Incidencia> findByFechaBetween(LocalDate desde, LocalDate hasta);
    List<Incidencia> findByHabitacion_IdHabitacionAndTipoAndEstadoIn(Long idHabitacion, TipoIncidencia tipo, List<EstadoIncidencia> estados);
}
