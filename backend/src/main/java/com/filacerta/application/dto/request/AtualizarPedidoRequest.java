package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.TipoPedido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarPedidoRequest {

    @NotBlank(message = "Nome do cliente é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String nomeCliente;

    @NotNull(message = "Tipo do pedido é obrigatório")
    private TipoPedido tipo;

    @Size(max = 300, message = "Observação deve ter no máximo 300 caracteres")
    private String observacao;

    @Valid
    private List<ItemPedidoRequest> itens = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPedidoRequest {
        private Long id;  // ID do item existente (para atualização)
        private Long produtoId;
        private Integer quantidade;
        private String observacao;
    }
}