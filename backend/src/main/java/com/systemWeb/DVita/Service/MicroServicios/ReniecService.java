package com.systemWeb.DVita.Service.MicroServicios;
import com.systemWeb.DVita.DTO.ReniecDataDTO;
import com.systemWeb.DVita.DTO.ReniecResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;

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
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        String url = UriComponentsBuilder
                .fromUriString(apiUrl)
                .pathSegment(numero)
                .toUriString();

        System.out.println("URL: " + url);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {

            ResponseEntity<ReniecResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    ReniecResponse.class
            );

            System.out.println("BODY: " + response.getBody());

            if(response.getBody() != null && response.getBody().isSuccess()){
                return response.getBody().getData();
            }

            return null;

        } catch (Exception e) {
            System.err.println("Error al consultar DNI:");
            e.printStackTrace();
            return null;
        }
    }
}
