package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.StatusItemPedido;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ItemPedidoResponse {
    private Long id;
    private Long produtoId;
    private String nomeProduto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private StatusItemPedido status;
    private String observacaoItem;
}