package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface AreaRepository extends JpaRepository<Area, Long> {
    List<Area> findByActivoTrue();
}
