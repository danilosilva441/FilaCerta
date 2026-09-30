package com.filacerta.application.dto.request;

import java.util.List;

public record AtualizarPedidoRequest(List<ItemPedidoRequest> itens) {
}