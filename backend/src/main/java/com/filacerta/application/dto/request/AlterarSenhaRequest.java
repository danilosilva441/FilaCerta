package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlterarSenhaRequest {
    
    @NotBlank(message = "A senha atual é obrigatória")
    private String senhaAtual;
    
    @NotBlank(message = "A nova senha é obrigatória")
    private String novaSenha;
    
    @NotBlank(message = "A confirmação da nova senha é obrigatória")
    private String confirmarSenhaNova;
}