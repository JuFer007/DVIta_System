package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Model.Habitacion;
import main.java.com.systemWeb.DVita.Model.Reserva;
import main.java.com.systemWeb.DVita.Repository.HabitacionRepository;
import main.java.com.systemWeb.DVita.Repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;

    public List<Reserva> listarTodos() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> buscarPorId(Long id) {
        return reservaRepository.findById(id);
    }

    public Reserva guardar(Reserva reserva) {
        return reservaRepository.save(reserva);
    }

    public Reserva actualizar(Long id, Reserva reservaActualizada) {
        return reservaRepository.findById(id).map(reserva -> {
            reserva.setCliente(reservaActualizada.getCliente());
            reserva.setHabitacion(reservaActualizada.getHabitacion());
            reserva.setEmpleado(reservaActualizada.getEmpleado());
            reserva.setFechaReserva(reservaActualizada.getFechaReserva());
            reserva.setFechaIngreso(reservaActualizada.getFechaIngreso());
            reserva.setFechaSalida(reservaActualizada.getFechaSalida());
            reserva.setEstadoReserva(reservaActualizada.getEstadoReserva());
            return reservaRepository.save(reserva);
        }).orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
    }

    public void eliminar(Long id) {
        reservaRepository.deleteById(id);
    }

    public Reserva checkIn(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        if ("CANCELADA".equals(reserva.getEstadoReserva()) ||
                "COMPLETADA".equals(reserva.getEstadoReserva())) {
            throw new IllegalStateException(
                    "No se puede hacer check-in en una reserva con estado: " + reserva.getEstadoReserva()
            );
        }

        reserva.setEstadoReserva("CONFIRMADA");
        reservaRepository.save(reserva);

        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null) {
            habitacion.setEstado("OCUPADA");
            habitacionRepository.save(habitacion);
        }
        return reserva;
    }

    public Reserva checkOut(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        if (!"CONFIRMADA".equals(reserva.getEstadoReserva())) {
            throw new IllegalStateException(
                    "Solo se puede hacer check-out en reservas CONFIRMADAS. Estado actual: " + reserva.getEstadoReserva()
            );
        }

        reserva.setEstadoReserva("COMPLETADA");
        reservaRepository.save(reserva);

        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null) {
            habitacion.setEstado("DISPONIBLE");
            habitacionRepository.save(habitacion);
        }
        return reserva;
    }
}
