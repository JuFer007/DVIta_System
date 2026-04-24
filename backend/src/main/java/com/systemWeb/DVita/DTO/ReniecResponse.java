package main.java.com.systemWeb.DVita.DTO;
import lombok.Data;

@Data

public class ReniecResponse {
    private boolean success;
    private ReniecDataDTO data;
    private String message;
}
