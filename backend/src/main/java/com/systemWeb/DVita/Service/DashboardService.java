package main.java.com.systemWeb.DVita.Service;
import main.java.com.systemWeb.DVita.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class DashboardService {
    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final ClienteRepository clienteRepository;
    private final PagoRepository pagoRepository;
    private final EmpleadoRepository empleadoRepository;

    public Map<String, Object> getStats() {
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);

        long reservasActivas = reservaRepository.findAll().stream().filter(r -> "PENDIENTE".equals(r.getEstadoReserva()) || "CONFIRMADA".equals(r.getEstadoReserva())).count();
        long reservasHoy = reservaRepository.findAll().stream().filter(r -> hoy.equals(r.getFechaReserva())).count();
        long habDisponibles = habitacionRepository.findAll().stream().filter(h -> "DISPONIBLE".equals(h.getEstado())).count();
        long habTotal = habitacionRepository.count();
        long clientesTotal = clienteRepository.count();

        BigDecimal ingresosMes = pagoRepository.findAll().stream().filter(p -> p.getFechaPago() != null && !p.getFechaPago().isBefore(inicioMes) && !p.getFechaPago().isAfter(hoy)).map(p -> p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDate inicioMesAnterior = inicioMes.minusMonths(1);
        LocalDate finMesAnterior = inicioMes.minusDays(1);
        BigDecimal ingresosAnterior = pagoRepository.findAll().stream().filter(p -> p.getFechaPago() != null && !p.getFechaPago().isBefore(inicioMesAnterior) && !p.getFechaPago().isAfter(finMesAnterior)).map(p -> p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);

        double pctIngresos = ingresosAnterior.compareTo(BigDecimal.ZERO) == 0 ? 0 : ingresosMes.subtract(ingresosAnterior).multiply(BigDecimal.valueOf(100)).divide(ingresosAnterior, 1, java.math.RoundingMode.HALF_UP).doubleValue();
        long checkOutsHoy = reservaRepository.findAll().stream().filter(r -> "CONFIRMADA".equals(r.getEstadoReserva()) && hoy.equals(r.getFechaSalida())).count();
        long checkInsHoy = reservaRepository.findAll().stream().filter(r -> "PENDIENTE".equals(r.getEstadoReserva()) && hoy.equals(r.getFechaIngreso())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("reservasActivas", reservasActivas);
        stats.put("reservasHoy", reservasHoy);
        stats.put("habitacionesDisponibles", habDisponibles);
        stats.put("habitacionesTotal", habTotal);
        stats.put("clientesTotal", clientesTotal);
        stats.put("ingresosMes", ingresosMes);
        stats.put("pctCambioIngresos", pctIngresos);
        stats.put("checkInsHoy", checkInsHoy);
        stats.put("checkOutsHoy", checkOutsHoy);
        stats.put("empleadosTotal", empleadoRepository.count());

        return stats;
    }

    public List<Map<String, Object>> getReservasRecientes() {
        return reservaRepository.findAll().stream().sorted(Comparator.comparing(r -> r.getFechaReserva() == null ? LocalDate.MIN : r.getFechaReserva(), Comparator.reverseOrder())).limit(8)
        .map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getIdReserva());
            m.put("cliente", r.getCliente() != null
                    ? r.getCliente().getNombre() + " " + r.getCliente().getApellidoPaterno()
                    : "—");
            m.put("habitacion", r.getHabitacion() != null
                    ? r.getHabitacion().getNumeroHabitacion()
                    : "—");
            m.put("tipoHabitacion", r.getHabitacion() != null
                    && r.getHabitacion().getTipoHabitacion() != null
                    ? r.getHabitacion().getTipoHabitacion().getDescripcion()
                    : "—");
            m.put("fechaIngreso", r.getFechaIngreso());
            m.put("fechaSalida", r.getFechaSalida());
            m.put("estado", r.getEstadoReserva());
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getHabitacionesEstado() {
        return habitacionRepository.findAll().stream().map(h -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", h.getIdHabitacion());
            m.put("numero", h.getNumeroHabitacion());
            m.put("tipo", h.getTipoHabitacion() != null
                    ? h.getTipoHabitacion().getDescripcion() : "—");
            m.put("estado", h.getEstado());
            m.put("precio", h.getPrecio());
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getIngresosMensuales() {
        LocalDate hoy = LocalDate.now();
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            LocalDate inicio = hoy.minusMonths(i).withDayOfMonth(1);
            LocalDate fin = inicio.withDayOfMonth(inicio.lengthOfMonth());
            BigDecimal total = pagoRepository.findAll().stream().filter(p -> p.getFechaPago() != null && !p.getFechaPago().isBefore(inicio) && !p.getFechaPago().isAfter(fin)).map(p -> p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO).reduce(BigDecimal.ZERO, BigDecimal::add);
            long cantPagos = pagoRepository.findAll().stream().filter(p -> p.getFechaPago() != null && !p.getFechaPago().isBefore(inicio) && !p.getFechaPago().isAfter(fin)).count();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("mes", inicio.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, new Locale("es")));
            m.put("anio", inicio.getYear());
            m.put("total", total);
            m.put("pagos", cantPagos);
            resultado.add(m);
        }
        return resultado;
    }

    public Map<String, Long> getReservasPorEstado() {
        Map<String, Long> resumen = reservaRepository.findAll().stream().collect(Collectors.groupingBy(r -> r.getEstadoReserva() != null ? r.getEstadoReserva() : "DESCONOCIDO", Collectors.counting()));

        for (String estado : List.of("PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA")) {
            resumen.putIfAbsent(estado, 0L);
        }
        return resumen;
    }

    public List<Map<String, Object>> getMetodosPago() {
        Map<String, List<BigDecimal>> agrupado = pagoRepository.findAll().stream().filter(p -> p.getMetodoPago() != null).collect(Collectors.groupingBy(p -> p.getMetodoPago(),Collectors.mapping(p -> p.getMonto() != null ? p.getMonto() : BigDecimal.ZERO, Collectors.toList())));

        return agrupado.entrySet().stream().map(e -> {
            BigDecimal total = e.getValue().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("metodo", e.getKey());
            m.put("total", total);
            m.put("cantidad", e.getValue().size());
            return m;}).sorted(Comparator.comparing(m -> ((BigDecimal) m.get("total")), Comparator.reverseOrder())).toList();
    }

    public List<Map<String, Object>> getOcupacionPorTipo() {
        Map<String, Map<String, Long>> agrupado = habitacionRepository.findAll().stream().filter(h -> h.getTipoHabitacion() != null).collect(Collectors.groupingBy(h -> h.getTipoHabitacion().getDescripcion(), Collectors.groupingBy(h -> h.getEstado() != null ? h.getEstado() : "DESCONOCIDO", Collectors.counting())));

        return agrupado.entrySet().stream().map(e -> {Map<String, Object> m = new LinkedHashMap<>();
            m.put("tipo", e.getKey());
            m.put("disponibles", e.getValue().getOrDefault("DISPONIBLE", 0L));
            m.put("ocupadas", e.getValue().getOrDefault("OCUPADA", 0L));
            m.put("mantenimiento", e.getValue().getOrDefault("MANTENIMIENTO", 0L));
            m.put("total", e.getValue().values().stream().mapToLong(Long::longValue).sum());
            return m;}).toList();
    }
}
