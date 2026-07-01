package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Horario;
import com.systemWeb.DVita.Model.enums.EstadoHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByEmpleado_IdEmpleado(Long idEmpleado);
    List<Horario> findByEmpleado_IdEmpleadoAndDiaSemana(Long idEmpleado, String diaSemana);
    List<Horario> findByEmpleado_IdEmpleadoAndDiaSemanaAndEstadoIn(Long idEmpleado, String diaSemana, List<EstadoHorario> estados);
    List<Horario> findByDiaSemanaAndEstado(String diaSemana, String estado);
}
