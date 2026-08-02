package com.filacerta.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.application.dto.response.ItemPedidoResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.domain.entity.Comanda;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PedidoMapper {

    @Lazy  // ← ADICIONAR @Lazy para quebrar o ciclo
    private final ComandaMapper comandaMapper;

    public Pedido toEntity(CriarPedidoRequest request) {
        if (request == null) {
            return null;
        }

        Pedido pedido = new Pedido();
        pedido.setNomeCliente(request.getNomeCliente());
        pedido.setTipo(request.getTipo());
        pedido.setObservacao(request.getObservacao());
        return pedido;
    }

    public PedidoResponse toResponse(Pedido pedido) {
        if (pedido == null) {
            return null;
        }

        List<ItemPedidoResponse> itensResponse = null;
        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            itensResponse = pedido.getItens().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());
        }

        ComandaResponse comandaResponse = null;
        if (pedido.getComandaPedido() != null) {
            Comanda comanda = pedido.getComandaPedido().getComanda();
            if (comanda != null) {
                comandaResponse = comandaMapper.toResponse(comanda);
            }
        }

        return PedidoResponse.builder()
            .id(pedido.getId())
            .numero(pedido.getNumero())
            .nomeCliente(pedido.getNomeCliente())
            .tipo(pedido.getTipo())
            .origem(pedido.getOrigem())
            .status(pedido.getStatus())
            .statusPagamento(pedido.getStatusPagamento())
            .metodoPagamento(pedido.getMetodoPagamento())
            .valorTotal(pedido.getValorTotal())
            .dataHoraPedido(pedido.getDataHoraPedido())
            .dataHoraPronto(pedido.getDataHoraPronto())
            .dataHoraEntrega(pedido.getDataHoraEntrega())
            .dataHoraPagamento(pedido.getDataHoraPagamento())
            .observacao(pedido.getObservacao())
            .itens(itensResponse)
            .comanda(comandaResponse)
            .build();
    }

    private ItemPedidoResponse toItemResponse(ItemPedido item) {
        if (item == null) {
            return null;
        }

        return ItemPedidoResponse.builder()
            .id(item.getId())
            .produtoId(item.getProduto().getId())
            .nomeProduto(item.getProduto().getNome())
            .descricaoProduto(item.getProduto().getDescricao())
            .quantidade(item.getQuantidade())
            .precoUnitario(item.getPrecoUnitario())
            .subtotal(item.getSubtotal())
            .status(item.getStatus())
            .observacaoItem(item.getObservacaoItem())
            .build();
    }

    public List<PedidoResponse> toResponseList(List<Pedido> pedidos) {
        if (pedidos == null) {
            return null;
        }
        return pedidos.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PedidoResponse toResponseWithoutComanda(Pedido pedido) {
        if (pedido == null) {
            return null;
        }

        List<ItemPedidoResponse> itensResponse = null;
        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            itensResponse = pedido.getItens().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());
        }

        return PedidoResponse.builder()
            .id(pedido.getId())
            .numero(pedido.getNumero())
            .nomeCliente(pedido.getNomeCliente())
            .tipo(pedido.getTipo())
            .origem(pedido.getOrigem())
            .status(pedido.getStatus())
            .statusPagamento(pedido.getStatusPagamento())
            .metodoPagamento(pedido.getMetodoPagamento())
            .valorTotal(pedido.getValorTotal())
            .dataHoraPedido(pedido.getDataHoraPedido())
            .dataHoraPronto(pedido.getDataHoraPronto())
            .dataHoraEntrega(pedido.getDataHoraEntrega())
            .dataHoraPagamento(pedido.getDataHoraPagamento())
            .observacao(pedido.getObservacao())
            .itens(itensResponse)
            .comanda(null)
            .build();
    }
}