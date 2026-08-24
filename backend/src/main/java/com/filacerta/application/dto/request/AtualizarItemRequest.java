package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.StatusItemPedido;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AtualizarItemRequest {
    @NotNull(message = "O novo status do item é obrigatório")
    private StatusItemPedido status;
}