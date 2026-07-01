package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.enums.EstadoHabitacion;
import com.systemWeb.DVita.Model.enums.EstadoReserva;
import com.systemWeb.DVita.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

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

        long reservasActivas = reservaRepository.countByEstadoReservaIn(List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA));
        long reservasHoy = reservaRepository.countByFechaReserva(hoy);
        long habDisponibles = habitacionRepository.countByEstado(EstadoHabitacion.DISPONIBLE);
        long habTotal = habitacionRepository.count();
        long clientesTotal = clienteRepository.count();

        BigDecimal ingresosMes = Optional.ofNullable(pagoRepository.sumMontoByFechaPagoBetween(inicioMes, hoy)).orElse(BigDecimal.ZERO);
        LocalDate inicioMesAnterior = inicioMes.minusMonths(1);
        LocalDate finMesAnterior = inicioMes.minusDays(1);
        BigDecimal ingresosAnterior = Optional.ofNullable(pagoRepository.sumMontoByFechaPagoBetween(inicioMesAnterior, finMesAnterior)).orElse(BigDecimal.ZERO);

        double pctIngresos = ingresosAnterior.compareTo(BigDecimal.ZERO) == 0 ? 0 : ingresosMes.subtract(ingresosAnterior).multiply(BigDecimal.valueOf(100)).divide(ingresosAnterior, 1, java.math.RoundingMode.HALF_UP).doubleValue();
        long checkOutsHoy = reservaRepository.countByEstadoReservaAndFechaSalida(EstadoReserva.CONFIRMADA, hoy);
        long checkInsHoy = reservaRepository.countByEstadoReservaAndFechaIngreso(EstadoReserva.PENDIENTE, hoy);

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
        return reservaRepository.findTop8ByOrderByFechaReservaDesc()
        .stream().map(r -> {
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
            BigDecimal total = Optional.ofNullable(pagoRepository.sumMontoByFechaPagoBetween(inicio, fin)).orElse(BigDecimal.ZERO);
            long cantPagos = pagoRepository.countByFechaPagoBetween(inicio, fin);

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
        Map<String, Long> resumen = new HashMap<>();
        List<Object[]> rows = reservaRepository.countGroupByEstadoReserva();
        for (Object[] row : rows) {
            EstadoReserva estado = (EstadoReserva) row[0];
            Long count = (Long) row[1];
            resumen.put(estado != null ? estado.name() : "PENDIENTE", count);
        }
        for (EstadoReserva estado : EstadoReserva.values()) {
            resumen.putIfAbsent(estado.name(), 0L);
        }
        return resumen;
    }

    public List<Map<String, Object>> getMetodosPago() {
        List<Object[]> rows = pagoRepository.sumGroupByMetodoPago();
        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("metodo", ((Enum) row[0]).name());
            m.put("total", (BigDecimal) row[1]);
            m.put("cantidad", (Long) row[2]);
            return m;
        }).sorted(Comparator.comparing(m -> ((BigDecimal) m.get("total")), Comparator.reverseOrder())).toList();
    }

    public List<Map<String, Object>> getOcupacionPorTipo() {
        List<Object[]> rows = habitacionRepository.countGroupByTipoAndEstado();
        Map<String, Map<EstadoHabitacion, Long>> agrupado = new HashMap<>();

        for (Object[] row : rows) {
            String tipo = (String) row[0];
            EstadoHabitacion estado = (EstadoHabitacion) row[1];
            Long count = (Long) row[2];
            agrupado.computeIfAbsent(tipo, k -> new HashMap<>()).put(estado, count);
        }

        return agrupado.entrySet().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("tipo", e.getKey());
            m.put("disponibles", e.getValue().getOrDefault(EstadoHabitacion.DISPONIBLE, 0L));
            m.put("ocupadas", e.getValue().getOrDefault(EstadoHabitacion.OCUPADA, 0L));
            m.put("mantenimiento", e.getValue().getOrDefault(EstadoHabitacion.MANTENIMIENTO, 0L));
            m.put("total", e.getValue().values().stream().mapToLong(Long::longValue).sum());
            return m;
        }).toList();
    }
}
