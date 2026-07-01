package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Cliente;
import com.systemWeb.DVita.Model.Consulta;
import com.systemWeb.DVita.Model.Empleado;
import com.systemWeb.DVita.Model.Reserva;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class EmailService {

    private final JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public void enviarCorreo(String para, String asunto, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("juniorfernandozumaetagolac@gmail.com");
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error al enviar correo a " + para + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async("emailExecutor")
    public void enviarConfirmacionReserva(Reserva reserva) {
        if (reserva.getCliente() == null || reserva.getCliente().getEmail() == null) return;
        enviarCorreoConLogo(
                reserva.getCliente().getEmail(),
                "Reserva Confirmada - D'Vita Hospedaje",
                cargarTemplate("templates/emails/reserva-confirmacion.html", reserva)
        );
    }

    @Async("emailExecutor")
    public void enviarCancelacionReserva(Reserva reserva) {
        if (reserva.getCliente() == null || reserva.getCliente().getEmail() == null) return;
        enviarCorreoConLogo(
                reserva.getCliente().getEmail(),
                "Reserva Cancelada - D'Vita Hospedaje",
                cargarTemplate("templates/emails/reserva-cancelada.html", reserva)
        );
    }

    @Async("emailExecutor")
    public void enviarRecordatorioCheckIn(Reserva reserva) {
        if (reserva.getCliente() == null || reserva.getCliente().getEmail() == null) return;
        enviarCorreoConLogo(
                reserva.getCliente().getEmail(),
                "Recordatorio de Check-In - D'Vita Hospedaje",
                cargarTemplate("templates/emails/reserva-recordatorio.html", reserva)
        );
    }

    @Async("emailExecutor")
    public void enviarRespuestaConsulta(Consulta consulta, Empleado empleado) {
        if (consulta.getEmail() == null) return;
        String nombreEmpleado = empleado.getNombre() + " " + empleado.getApellidoP() + " " + (empleado.getApellidoM() != null ? empleado.getApellidoM() : "");
        enviarCorreoConLogo(
                consulta.getEmail(),
                "Respuesta a tu consulta - D'Vita Hospedaje",
                cargarTemplate("templates/emails/consulta-respuesta.html", Map.ofEntries(
                        Map.entry("nombre", consulta.getNombre()),
                        Map.entry("mensajeOriginal", consulta.getMensaje()),
                        Map.entry("respuesta", consulta.getRespuesta()),
                        Map.entry("empleado", nombreEmpleado)
                ))
        );
    }

    private void enviarCorreoConLogo(String para, String asunto, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("juniorfernandozumaetagolac@gmail.com");
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(html, true);
            helper.addInline("logo", new ClassPathResource("static/DVita_Logo.png"));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error al enviar correo a " + para + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String cargarTemplate(String ruta, Reserva r) {
        return cargarTemplate(ruta, Map.ofEntries(
                Map.entry("huesped", nombreCompleto(r.getCliente())),
                Map.entry("nroReserva", String.valueOf(r.getIdReserva())),
                Map.entry("fechaIngreso", r.getFechaIngreso().format(DATE_FMT)),
                Map.entry("fechaSalida", r.getFechaSalida().format(DATE_FMT)),
                Map.entry("noches", String.valueOf(r.getNoches())),
                Map.entry("tipoHabitacion", r.getHabitacion().getTipoHabitacion().getDescripcion()),
                Map.entry("nroHabitacion", String.valueOf(r.getHabitacion().getNumeroHabitacion())),
                Map.entry("total", r.getMontoTotal().toString()),
                Map.entry("metodoPago", "PENDIENTE")
        ));
    }

    private String cargarTemplate(String ruta, Map<String, String> valores) {
        try {
            String template = new BufferedReader(
                    new InputStreamReader(
                            new ClassPathResource(ruta).getInputStream(), StandardCharsets.UTF_8))
                    .lines().collect(Collectors.joining("\n"));
            for (Map.Entry<String, String> e : valores.entrySet()) {
                template = template.replace("{{" + e.getKey() + "}}", e.getValue());
            }
            return template;
        } catch (Exception e) {
            System.err.println("Error al cargar template " + ruta + ": " + e.getMessage());
            return "<p>Error al generar el correo.</p>";
        }
    }

    private String nombreCompleto(Cliente c) {
        return c.getNombre() + " " + c.getApellidoPaterno() + " " + (c.getApellidoMaterno() != null ? c.getApellidoMaterno() : "");
    }
}
