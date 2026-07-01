package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findAllByOrderByFechaDesc();
    List<Consulta> findByRespondidoFalseOrderByFechaDesc();
}
