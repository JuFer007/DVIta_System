package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Reserva;
import com.systemWeb.DVita.Repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class ReservaService {
    private final ReservaRepository reservaRepository;

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
}
