package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Pago;
import com.systemWeb.DVita.Model.enums.EstadoPago;
import com.systemWeb.DVita.Model.enums.MetodoPago;
import com.systemWeb.DVita.Repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class PagoService {
    private final PagoRepository pagoRepository;

    public List<Pago> listarTodos() {
        return pagoRepository.findAll();
    }

    public Optional<Pago> buscarPorId(Long id) {
        return pagoRepository.findById(id);
    }

    public Pago guardar(Pago pago) {
        if (pago.getEstado() == null) {
            pago.setEstado(EstadoPago.PENDIENTE);
        }
        return pagoRepository.save(pago);
    }

    public Pago actualizar(Long id, Pago pagoActualizado) {
        return pagoRepository.findById(id).map(pago -> {
            if (EstadoPago.COMPLETADO == pago.getEstado()) {
                throw new RuntimeException("No se puede editar un pago ya completado");
            }
            pago.setReserva(pagoActualizado.getReserva());
            pago.setMonto(pagoActualizado.getMonto());
            pago.setFechaPago(pagoActualizado.getFechaPago());
            pago.setMetodoPago(pagoActualizado.getMetodoPago());
            if (pagoActualizado.getEstado() != null) {
                pago.setEstado(pagoActualizado.getEstado());
            }
            return pagoRepository.save(pago);
        }).orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
    }

    public Pago completar(Long id, MetodoPago metodoPago) {
        return pagoRepository.findById(id).map(pago -> {
            if (EstadoPago.COMPLETADO == pago.getEstado()) {
                throw new RuntimeException("El pago ya está completado");
            }
            pago.setEstado(EstadoPago.COMPLETADO);
            pago.setMetodoPago(metodoPago);
            return pagoRepository.save(pago);
        }).orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }


}
