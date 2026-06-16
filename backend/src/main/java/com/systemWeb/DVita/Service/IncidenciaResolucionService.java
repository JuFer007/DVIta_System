package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.IncidenciaResolucion;
import com.systemWeb.DVita.Repository.IncidenciaResolucionRepository;
import com.systemWeb.DVita.Repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor

public class IncidenciaResolucionService {
    private final IncidenciaResolucionRepository repository;
    private final EmpleadoRepository empleadoRepository;

    public List<IncidenciaResolucion> listarPorIncidencia(Long idIncidencia) {
        return repository.findByIncidencia_IdIncidenciaOrderByVersionAsc(idIncidencia);
    }

    public IncidenciaResolucion guardar(IncidenciaResolucion resolucion) {
        if (resolucion.getEmpleadoResuelve() != null && resolucion.getEmpleadoResuelve().getIdEmpleado() != null) {
            empleadoRepository.findById(resolucion.getEmpleadoResuelve().getIdEmpleado())
                    .ifPresent(resolucion::setEmpleadoResuelve);
        }
        return repository.save(resolucion);
    }
}
