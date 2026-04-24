package main.java.com.systemWeb.DVita.Service.MicroServicios;
import main.java.com.systemWeb.DVita.DTO.ReniecDataDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class ReniecService {

    @Value("${reniec.api.url}")
    private String apiUrl;

    @Value("${reniec.api.token}")
    private String apiToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public ReniecDataDTO consultarDni(String numero) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        String url = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("numero", numero)
                .build()
                .toUriString();

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<ReniecDataDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    ReniecDataDTO.class
            );
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Error al consultar DNI: " + e.getMessage());
            return null;
        }
    }
}
