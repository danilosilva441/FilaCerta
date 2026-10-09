package com.filacerta.application.dto.request;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record AtualizarPedidoRequest(
    @JsonProperty("itens") List<ItemPedidoRequest> itens
) {}