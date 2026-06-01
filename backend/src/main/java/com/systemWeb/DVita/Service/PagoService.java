package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Pago;
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
        pago.setMetodoPago(upper(pago.getMetodoPago()));
        return pagoRepository.save(pago);
    }

    public Pago actualizar(Long id, Pago pagoActualizado) {
        return pagoRepository.findById(id).map(pago -> {
            pago.setReserva(pagoActualizado.getReserva());
            pago.setMonto(pagoActualizado.getMonto());
            pago.setFechaPago(pagoActualizado.getFechaPago());
            pago.setMetodoPago(upper(pagoActualizado.getMetodoPago()));
            return pagoRepository.save(pago);
        }).orElseThrow(() -> new RuntimeException("Pago no encontrado con id: " + id));
    }

    private static String upper(String s) {
        return s != null ? s.toUpperCase().trim() : null;
    }


}
