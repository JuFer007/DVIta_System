package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository

public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByReservaIdReserva(Long idReserva);
    void deleteByReservaIdReserva(Long idReserva);
}
