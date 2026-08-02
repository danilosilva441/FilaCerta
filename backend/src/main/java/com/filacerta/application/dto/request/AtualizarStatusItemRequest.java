package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.StatusItemPedido;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarStatusItemRequest {

    @NotNull(message = "Status é obrigatório")
    private StatusItemPedido status;
}