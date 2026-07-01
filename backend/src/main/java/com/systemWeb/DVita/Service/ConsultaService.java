package com.systemWeb.DVita.Service;
import com.systemWeb.DVita.Model.Consulta;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Repository.ConsultaRepository;
import com.systemWeb.DVita.Service.MicroServicios.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class ConsultaService {
    private final ConsultaRepository consultaRepository;
    private final EmailService emailService;

    public List<Consulta> listarTodas() {
        return consultaRepository.findAllByOrderByFechaDesc();
    }

    public Consulta guardar(@Valid Consulta consulta) {
        if (consulta.getFecha() == null) consulta.setFecha(LocalDateTime.now());
        if (consulta.getRespondido() == null) consulta.setRespondido(false);
        return consultaRepository.save(consulta);
    }

    public Consulta responder(Long id, String respuesta, Empleado empleado) {
        return consultaRepository.findById(id).map(consulta -> {
            consulta.setRespuesta(respuesta);
            consulta.setRespondido(true);
            consulta.setFechaRespuesta(LocalDateTime.now());
            consulta.setEmpleadoResponde(empleado);
            Consulta saved = consultaRepository.save(consulta);
            emailService.enviarRespuestaConsulta(saved, empleado);
            return saved;
        }).orElseThrow(() -> new RuntimeException("Consulta no encontrada con id: " + id));
    }
}
