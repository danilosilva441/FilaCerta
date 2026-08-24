package com.filacerta.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ItemPedidoRequest {

    @NotNull(message = "ID do produto é obrigatório")
    private Long produtoId;

    @Min(value = 1, message = "Quantidade mínima é 1")
    @Max(value = 50, message = "Quantidade máxima é 50")
    private Integer quantidade;

    private String observacaoItem;
}