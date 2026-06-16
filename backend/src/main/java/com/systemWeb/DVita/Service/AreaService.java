package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Area;
import com.systemWeb.DVita.Repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class AreaService {
    private final AreaRepository areaRepository;

    public List<Area> listarTodas() {
        return areaRepository.findByActivoTrue();
    }

    public List<Area> listarTodasAdmin() {
        return areaRepository.findAll();
    }

    public Optional<Area> buscarPorId(Long id) {
        return areaRepository.findById(id);
    }

    public Area guardar(Area area) {
        area.setNombre(area.getNombre().toUpperCase().trim());
        return areaRepository.save(area);
    }

    public Area actualizar(Long id, Area areaActualizada) {
        return areaRepository.findById(id).map(area -> {
            area.setNombre(areaActualizada.getNombre().toUpperCase().trim());
            area.setPrioridadBase(areaActualizada.getPrioridadBase());
            area.setNivelPrioridad(areaActualizada.getNivelPrioridad());
            area.setDescripcion(areaActualizada.getDescripcion());
            area.setActivo(areaActualizada.getActivo());
            return areaRepository.save(area);
        }).orElseThrow(() -> new RuntimeException("Área no encontrada con id: " + id));
    }
}
