package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.Model.Cliente;
import com.systemWeb.DVita.Repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientePdfService {
    private final PdfService pdfService;
    private final ClienteRepository clienteRepository;

    public byte[] generarDirectorioClientes() {
        List<Cliente> clientes = clienteRepository.findAll();

        List<Map<String, Object>> clientesList = new ArrayList<>();
        for (int i = 0; i < clientes.size(); i++) {
            Cliente c = clientes.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", i + 1);
            m.put("nombre", c.getNombre() + " " + c.getApellidoPaterno() + " " + c.getApellidoMaterno());
            m.put("dni", c.getDni());
            m.put("telefono", c.getTelefono() != null ? c.getTelefono() : "—");
            m.put("email", c.getEmail() != null ? c.getEmail() : "—");
            clientesList.add(m);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("clientes", clientesList);
        data.put("total", clientes.size());
        data.put("fechaGeneracion", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        return pdfService.generarPdf("/generar-reporte-clientes", data);
    }
}
