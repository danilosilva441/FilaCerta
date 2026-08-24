package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.OrigemPedido;
import com.filacerta.domain.enums.TipoPedido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CriarPedidoRequest {

    @NotBlank(message = "Nome do cliente é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String nomeCliente;

    @NotNull(message = "Tipo de pedido é obrigatório")
    private TipoPedido tipo;

    @NotNull(message = "Origem é obrigatória")
    private OrigemPedido origem;

    @NotEmpty(message = "Pedido deve conter pelo menos 1 item")
    @Valid
    private List<ItemPedidoRequest> itens;

    private String observacao;
}