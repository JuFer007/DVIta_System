package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByHabitacionIdHabitacionAndEstadoReservaNot(Long idHabitacion, String estadoExcluido);

    @Query("SELECT r FROM Reserva r WHERE r.habitacion.idHabitacion = :idHabitacion " +
    "AND r.estadoReserva NOT IN ('CANCELADA') " +
    "AND r.fechaIngreso < :fechaSalida AND r.fechaSalida > :fechaIngreso")
    List<Reserva> findOverlapping(
    @Param("idHabitacion") Long idHabitacion,
    @Param("fechaIngreso") LocalDate fechaIngreso,
    @Param("fechaSalida") LocalDate fechaSalida);

    @Query("SELECT r FROM Reserva r WHERE r.habitacion.idHabitacion = :idHabitacion " +
    "AND r.idReserva <> :idReserva " +
    "AND r.estadoReserva NOT IN ('CANCELADA') " +
    "AND r.fechaIngreso < :fechaSalida AND r.fechaSalida > :fechaIngreso")
    List<Reserva> findOverlappingExcludingId(
    @Param("idHabitacion") Long idHabitacion,
    @Param("fechaIngreso") LocalDate fechaIngreso,
    @Param("fechaSalida") LocalDate fechaSalida,
    @Param("idReserva") Long idReserva);

    List<Reserva> findByFechaIngresoAndEstadoReservaNot(LocalDate fechaIngreso, String estadoReserva);
    List<Reserva> findByFechaReservaBetween(LocalDate desde, LocalDate hasta);
}
