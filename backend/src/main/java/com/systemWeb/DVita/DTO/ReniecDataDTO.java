package main.java.com.systemWeb.DVita.DTO;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data

public class ReniecDataDTO {
    @JsonProperty("document_number")
    private String numero;
    @JsonProperty("first_name")
    private String nombres;
    @JsonProperty("first_last_name")
    private String apellidoPaterno;
    @JsonProperty("second_last_name")
    private String apellidoMaterno;
    @JsonProperty("full_name")
    private String nombreCompleto;
}
