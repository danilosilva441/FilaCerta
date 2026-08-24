package com.filacerta.application.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AbrirCaixaRequest {
    @NotNull(message = "O valor inicial (troco) é obrigatório")
    @Min(value = 0, message = "O valor inicial não pode ser negativo")
    private BigDecimal valorInicial;
}