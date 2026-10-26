package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CriarUsuarioRequest {
    @NotBlank(message = "O nome de usuário é obrigatório")
    private String username;
    
    @NotBlank(message = "A senha é obrigatória")
    private String password;
    
    @NotBlank(message = "A role (perfil) é obrigatória")
    private String role; // Ex: "ADMIN", "CAIXA", "COZINHA"
}