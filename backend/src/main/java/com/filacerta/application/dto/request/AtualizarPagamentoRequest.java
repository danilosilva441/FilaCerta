package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.StatusPagamento;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AtualizarPagamentoRequest {
    @NotNull(message = "O status de pagamento é obrigatório")
    private StatusPagamento statusPagamento;
}