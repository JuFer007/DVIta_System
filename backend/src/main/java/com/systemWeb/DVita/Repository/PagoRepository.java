package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository

public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByReservaIdReserva(Long idReserva);
    void deleteByReservaIdReserva(Long idReserva);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.fechaPago BETWEEN :desde AND :hasta")
    BigDecimal sumMontoByFechaPagoBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(p) FROM Pago p WHERE p.fechaPago BETWEEN :desde AND :hasta")
    long countByFechaPagoBetween(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT p.metodoPago, COALESCE(SUM(p.monto), 0), COUNT(p) FROM Pago p WHERE p.metodoPago IS NOT NULL GROUP BY p.metodoPago")
    List<Object[]> sumGroupByMetodoPago();
}
