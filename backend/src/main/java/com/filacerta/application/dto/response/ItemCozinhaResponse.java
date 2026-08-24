package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.CategoriaProduto;
import com.filacerta.domain.enums.StatusItemPedido;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ItemCozinhaResponse {
    private Long itemId;
    private String nomeProduto;
    private Integer quantidade;
    private CategoriaProduto categoria;
    private StatusItemPedido status;
    private String observacaoItem;
}