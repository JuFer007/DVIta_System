package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface IncidenciaResolucionRepository extends JpaRepository<IncidenciaResolucion, Long> {
    List<IncidenciaResolucion> findByIncidencia_IdIncidenciaOrderByVersionAsc(Long idIncidencia);
}
