package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    @Query("SELECT h FROM Habitacion h WHERE h.idHabitacion NOT IN (SELECT r.habitacion.idHabitacion " +
    "FROM Reserva r WHERE r.estadoReserva <> 'CANCELADA' AND r.fechaIngreso <= :fechaSalida AND r.fechaSalida >= :fechaIngreso) AND h.estado <> 'MANTENIMIENTO'")
    List<Habitacion> findHabitacionesDisponibles(@Param("fechaIngreso") LocalDate fechaIngreso, @Param("fechaSalida") LocalDate fechaSalida);

    @Query("SELECT h FROM Habitacion h WHERE h.tipoHabitacion.idTipoHabitacion = :tipoId AND h.idHabitacion NOT IN (SELECT r.habitacion.idHabitacion " +
    "FROM Reserva r WHERE r.estadoReserva <> 'CANCELADA' AND r.fechaIngreso <= :fechaSalida AND r.fechaSalida >= :fechaIngreso) AND h.estado <> 'MANTENIMIENTO'")
    List<Habitacion> findDisponiblesByTipo(@Param("tipoId") Long tipoId, @Param("fechaIngreso") LocalDate fechaIngreso, @Param("fechaSalida") LocalDate fechaSalida);

    @Query("SELECT h FROM Habitacion h WHERE h.estado = 'MANTENIMIENTO' AND EXISTS (" +
    "SELECT 1 FROM Reserva r WHERE r.habitacion.idHabitacion = h.idHabitacion " +
    "AND r.estadoReserva <> 'CANCELADA' AND r.fechaIngreso >= :hoy AND r.fechaIngreso <= :limite)")
    List<Habitacion> findMantenimientoConReservaProxima(@Param("hoy") LocalDate hoy, @Param("limite") LocalDate limite);
}
