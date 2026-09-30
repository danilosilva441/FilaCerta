package com.filacerta.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.ItemCozinhaResponse;
import com.filacerta.application.dto.response.ItemPedidoResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;

@Component
public class PedidoMapper {

	public static PedidoResponse toResponse(Pedido pedido) {
        if (pedido == null) return null;

        List<ItemPedidoResponse> itensResponse = pedido.getItens().stream()
                .map(PedidoMapper::toItemResponse)
                .collect(Collectors.toList());
                
        // Verifica a forma de pagamento de forma segura
        String formaPag = pedido.getFormaPagamento() != null ? pedido.getFormaPagamento().name() : null;

        return PedidoResponse.builder()
                .id(pedido.getId())
                .numero(pedido.getNumero())
                .nomeCliente(pedido.getNomeCliente())
                .tipo(pedido.getTipo())
                .status(pedido.getStatus())
                .statusPagamento(pedido.getStatusPagamento())
                .formaPagamento(formaPag)
                .valorTotal(pedido.getValorTotal())
                .dataHoraPedido(pedido.getDataHoraPedido())
                .codigoAcompanhamento(pedido.getCodigoAcompanhamento()) 
                .itens(itensResponse)
                .build();
    }

    private static ItemPedidoResponse toItemResponse(ItemPedido item) {
        if (item == null) return null;

        return ItemPedidoResponse.builder()
                .id(item.getId())
                .produtoId(item.getProduto().getId())
                .nomeProduto(item.getProduto().getNome())
                .quantidade(item.getQuantidade())
                .precoUnitario(item.getPrecoUnitario())
                .status(item.getStatus())
                .observacaoItem(item.getObservacaoItem())
                .build();
    }
    
    public static FilaCozinhaResponse toFilaCozinhaResponse(Pedido pedido) {
        if (pedido == null) return null;

        List<ItemCozinhaResponse> itensCozinha = pedido.getItens().stream()
                .map(PedidoMapper::toItemCozinhaResponse)
                .collect(Collectors.toList());

        // Calcula o tempo de espera (minutos desde a criação do pedido)
        long minutosEspera = java.time.Duration.between(pedido.getDataHoraPedido(), java.time.LocalDateTime.now()).toMinutes();
        String tempoStr = minutosEspera + " min";

        return FilaCozinhaResponse.builder()
                .pedidoId(pedido.getId())
                .numero(pedido.getNumero())
                .nomeCliente(pedido.getNomeCliente())
                .status(pedido.getStatus())
                .dataHoraPedido(pedido.getDataHoraPedido())
                .tempoEspera(tempoStr)
                .itens(itensCozinha)
                .build();
    }

    private static ItemCozinhaResponse toItemCozinhaResponse(ItemPedido item) {
        if (item == null) return null;

        return ItemCozinhaResponse.builder()
                .itemId(item.getId())
                .nomeProduto(item.getProduto().getNome())
                .quantidade(item.getQuantidade())
                // CORREÇÃO: Extraindo apenas o nome em texto de forma segura
                .categoria(item.getProduto() != null && item.getProduto().getCategoria() != null ? item.getProduto().getCategoria().getNome() : "Sem Categoria")
                .status(item.getStatus())
                .observacaoItem(item.getObservacaoItem())
                .build();
    }
}