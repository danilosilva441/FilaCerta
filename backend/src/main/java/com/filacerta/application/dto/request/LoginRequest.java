package com.filacerta.application.dto.request; // Ajuste para o seu pacote correto

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "O utilizador é obrigatório.")
    String username,

    @NotBlank(message = "A palavra-passe é obrigatória.")
    String password
) {}