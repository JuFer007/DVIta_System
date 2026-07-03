package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.DTO.ReservaDTO;
import com.systemWeb.DVita.Model.Cliente;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Habitacion;
import com.systemWeb.DVita.Model.Pago;
import com.systemWeb.DVita.Model.Reserva;
import com.systemWeb.DVita.Model.enums.EstadoHabitacion;
import com.systemWeb.DVita.Model.enums.EstadoPago;
import com.systemWeb.DVita.Model.enums.EstadoReserva;
import com.systemWeb.DVita.Model.enums.MetodoPago;
import com.systemWeb.DVita.Repository.ClienteRepository;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import com.systemWeb.DVita.Repository.HabitacionRepository;
import com.systemWeb.DVita.Repository.PagoRepository;
import com.systemWeb.DVita.Repository.ReservaRepository;
import com.systemWeb.DVita.Service.MicroServicios.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PagoRepository pagoRepository;
    private final EmailService emailService;

    public List<Reserva> listarTodos() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> buscarPorId(Long id) {
        return reservaRepository.findById(id);
    }

    @Transactional
    public Reserva guardar(Reserva reserva) {
        validarDisponibilidad(reserva.getHabitacion().getIdHabitacion(),
                reserva.getFechaIngreso(), reserva.getFechaSalida(),
                reserva.getIdReserva());
        Reserva saved = reservaRepository.save(reserva);
        generarPago(saved);
        emailService.enviarConfirmacionReserva(saved);
        return saved;
    }

    @Transactional
    public Reserva crearConDni(ReservaDTO request) {
        Cliente cliente = resolverCliente(request);
        Habitacion habitacion = habitacionRepository.findById(request.getIdHabitacion())
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada con id: " + request.getIdHabitacion()));
        Empleado empleado = request.getIdEmpleado() != null
                ? empleadoRepository.findById(request.getIdEmpleado())
                        .orElse(null)
                : null;

        validarDisponibilidad(request.getIdHabitacion(),
                request.getFechaIngreso(), request.getFechaSalida(), null);

        Reserva reserva = Reserva.builder()
                .cliente(cliente)
                .habitacion(habitacion)
                .empleado(empleado)
                .fechaReserva(request.getFechaReserva())
                .fechaIngreso(request.getFechaIngreso())
                .fechaSalida(request.getFechaSalida())
                .estadoReserva(request.getEstadoReserva() != null ? EstadoReserva.valueOf(request.getEstadoReserva()) : null)
                .build();

        Reserva saved = reservaRepository.save(reserva);
        generarPago(saved);
        emailService.enviarConfirmacionReserva(saved);
        return saved;
    }

    private void validarDisponibilidad(Long idHabitacion, LocalDate fechaIngreso,
                                       LocalDate fechaSalida, Long idReservaExcluir) {
        if (fechaIngreso != null && fechaSalida != null && !fechaSalida.isAfter(fechaIngreso)) {
            throw new IllegalStateException("La fecha de salida debe ser posterior a la fecha de ingreso");
        }

        List<Reserva> conflictos = (idReservaExcluir != null)
                ? reservaRepository.findOverlappingExcludingId(idHabitacion, fechaIngreso, fechaSalida, idReservaExcluir)
                : reservaRepository.findOverlapping(idHabitacion, fechaIngreso, fechaSalida);

        if (!conflictos.isEmpty()) {
            throw new IllegalStateException(
                    "La habitación ya está reservada en esas fechas. " +
                    "Conflicto con reserva #" + conflictos.get(0).getIdReserva()
            );
        }
    }

    private Cliente resolverCliente(ReservaDTO request) {
        if (request.getIdCliente() != null) {
            return clienteRepository.findById(request.getIdCliente())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado con id: " + request.getIdCliente()));
        }

        if (request.getDniCliente() != null && !request.getDniCliente().isBlank()) {
            return clienteRepository.findByDni(request.getDniCliente())
                    .orElseGet(() -> {
                        Cliente nuevo = Cliente.builder()
                                .dni(upper(request.getDniCliente()))
                                .nombre(upper(request.getNombreCliente()))
                                .apellidoPaterno(upper(request.getApellidoPaterno()))
                                .apellidoMaterno(upper(request.getApellidoMaterno()))
                                .telefono(request.getTelefonoCliente() != null ? upper(request.getTelefonoCliente()) : "999999999")
                                .email(upper(request.getEmailCliente()))
                                .build();
                        return clienteRepository.save(nuevo);
                    });
        }

        throw new RuntimeException("Debe proporcionar un cliente (id o DNI)");
    }

    @Transactional
    public Reserva actualizar(Long id, Reserva reservaActualizada) {
        return reservaRepository.findById(id).map(reserva -> {
            reserva.setCliente(reservaActualizada.getCliente());
            reserva.setHabitacion(reservaActualizada.getHabitacion());
            reserva.setEmpleado(reservaActualizada.getEmpleado());
            reserva.setFechaReserva(reservaActualizada.getFechaReserva());
            reserva.setFechaIngreso(reservaActualizada.getFechaIngreso());
            reserva.setFechaSalida(reservaActualizada.getFechaSalida());
            reserva.setEstadoReserva(reservaActualizada.getEstadoReserva());

            validarDisponibilidad(
                reservaActualizada.getHabitacion().getIdHabitacion(),
                reservaActualizada.getFechaIngreso(),
                reservaActualizada.getFechaSalida(),
                id
            );

            return reservaRepository.save(reserva);
        }).orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
    }



    private void generarPago(Reserva reserva) {
        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion == null || habitacion.getTipoHabitacion() == null) return;

        long noches = ChronoUnit.DAYS.between(reserva.getFechaIngreso(), reserva.getFechaSalida());
        if (noches < 1) noches = 1;

        BigDecimal monto = habitacion.getTipoHabitacion().getPrecio().multiply(BigDecimal.valueOf(noches));

        Pago pago = Pago.builder()
                .reserva(reserva)
                .monto(monto)
                .fechaPago(LocalDate.now())
                .metodoPago(MetodoPago.EFECTIVO)
                .estado(EstadoPago.PENDIENTE)
                .build();

        pagoRepository.save(pago);
    }

    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        if (EstadoReserva.CANCELADA == reserva.getEstadoReserva() ||
                EstadoReserva.COMPLETADA == reserva.getEstadoReserva()) {
            throw new IllegalStateException(
                    "No se puede cancelar una reserva con estado: " + reserva.getEstadoReserva()
            );
        }

        reserva.setEstadoReserva(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);

        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null && EstadoHabitacion.OCUPADA == habitacion.getEstado()) {
            habitacion.setEstado(EstadoHabitacion.EN_LIMPIEZA);
            habitacionRepository.save(habitacion);
        }

        emailService.enviarCancelacionReserva(reserva);
        return reserva;
    }

    @Transactional
    public Reserva checkIn(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        if (EstadoReserva.CANCELADA == reserva.getEstadoReserva() ||
                EstadoReserva.COMPLETADA == reserva.getEstadoReserva()) {
            throw new IllegalStateException(
                    "No se puede hacer check-in en una reserva con estado: " + reserva.getEstadoReserva()
            );
        }

        reserva.setEstadoReserva(EstadoReserva.CONFIRMADA);
        reservaRepository.save(reserva);

        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null) {
            habitacion.setEstado(EstadoHabitacion.OCUPADA);
            habitacionRepository.save(habitacion);
        }
        return reserva;
    }

    @Transactional
    public Reserva checkOut(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));

        if (EstadoReserva.CONFIRMADA != reserva.getEstadoReserva()) {
            throw new IllegalStateException(
                    "Solo se puede hacer check-out en reservas CONFIRMADAS. Estado actual: " + reserva.getEstadoReserva()
            );
        }

        reserva.setEstadoReserva(EstadoReserva.COMPLETADA);
        reservaRepository.save(reserva);

        Habitacion habitacion = reserva.getHabitacion();
        if (habitacion != null) {
            habitacion.setEstado(EstadoHabitacion.EN_LIMPIEZA);
            habitacionRepository.save(habitacion);
        }
        return reserva;
    }

    @Transactional
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoCompletarReservasVencidas() {
        LocalDate hoy = LocalDate.now();
        List<Reserva> vencidas = reservaRepository.findAll().stream()
                .filter(r -> (EstadoReserva.CONFIRMADA == r.getEstadoReserva())
                        && r.getFechaSalida() != null && r.getFechaSalida().isBefore(hoy))
                .collect(Collectors.toList());
        for (Reserva r : vencidas) {
            r.setEstadoReserva(EstadoReserva.COMPLETADA);
            reservaRepository.save(r);
            Habitacion h = r.getHabitacion();
            if (h != null && EstadoHabitacion.OCUPADA == h.getEstado()) {
                h.setEstado(EstadoHabitacion.EN_LIMPIEZA);
                habitacionRepository.save(h);
            }
        }
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void enviarRecordatoriosCheckIn() {
        LocalDate manana = LocalDate.now().plusDays(1);
        List<Reserva> reservas = reservaRepository.findByFechaIngresoAndEstadoReservaNot(manana, EstadoReserva.CANCELADA.name());
        for (Reserva r : reservas) {
            emailService.enviarRecordatorioCheckIn(r);
        }
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }
}