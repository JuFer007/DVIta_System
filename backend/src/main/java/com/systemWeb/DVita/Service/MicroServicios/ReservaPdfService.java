package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Reserva;
import com.systemWeb.DVita.Repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaPdfService {
    private final PdfService pdfService;
    private final ReservaRepository reservaRepository;

    public byte[] generarReporteReservas(LocalDate desde, LocalDate hasta) {
        List<Reserva> reservas = reservaRepository.findByFechaReservaBetween(desde, hasta);

        long total = reservas.size();
        long pendiente = reservas.stream().filter(r -> "PENDIENTE".equals(r.getEstadoReserva())).count();
        long confirmada = reservas.stream().filter(r -> "CONFIRMADA".equals(r.getEstadoReserva())).count();
        long completada = reservas.stream().filter(r -> "COMPLETADA".equals(r.getEstadoReserva())).count();
        long cancelada = reservas.stream().filter(r -> "CANCELADA".equals(r.getEstadoReserva())).count();

        List<Map<String, Object>> reservasList = reservas.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getIdReserva());
            m.put("cliente", r.getCliente() != null
                    ? r.getCliente().getNombre() + " " + r.getCliente().getApellidoPaterno() : "—");
            m.put("habitacion", r.getHabitacion() != null
                    ? String.valueOf(r.getHabitacion().getNumeroHabitacion()) : "—");
            m.put("tipoHabitacion", r.getHabitacion() != null && r.getHabitacion().getTipoHabitacion() != null
                    ? r.getHabitacion().getTipoHabitacion().getDescripcion() : "—");
            m.put("fechaIngreso", r.getFechaIngreso() != null ? r.getFechaIngreso().toString() : "—");
            m.put("fechaSalida", r.getFechaSalida() != null ? r.getFechaSalida().toString() : "—");
            m.put("noches", r.getNoches());
            m.put("estado", r.getEstadoReserva());
            return m;
        }).toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("pendiente", pendiente);
        stats.put("confirmada", confirmada);
        stats.put("completada", completada);
        stats.put("cancelada", cancelada);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reservas", reservasList);
        data.put("stats", stats);
        data.put("desde", desde.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        data.put("hasta", hasta.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-reservas", data);
    }
}
