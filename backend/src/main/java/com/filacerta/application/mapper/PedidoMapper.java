package com.filacerta.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.domain.entity.Pedido;

@Component
public class PedidoMapper {

	public Pedido toEntity(CriarPedidoRequest request) {
		if (request == null) {
			return null;
		}

		Pedido pedido = new Pedido();
		pedido.setNomeCliente(request.getNomeCliente());
		pedido.setTipo(request.getTipo());
		pedido.setObservacao(request.getObservacao());
		// Os itens serão adicionados depois
		return pedido;
	}

	public PedidoResponse toResponse(Pedido pedido) {
		if (pedido == null) {
			return null;
		}

		return PedidoResponse.builder().id(pedido.getId()).numero(pedido.getNumero())
				.nomeCliente(pedido.getNomeCliente()).tipo(pedido.getTipo()).origem(pedido.getOrigem())
				.status(pedido.getStatus()).statusPagamento(pedido.getStatusPagamento())
				.metodoPagamento(pedido.getMetodoPagamento()).valorTotal(pedido.getValorTotal())
				.dataHoraPedido(pedido.getDataHoraPedido()).dataHoraPronto(pedido.getDataHoraPronto())
				.dataHoraEntrega(pedido.getDataHoraEntrega()).dataHoraPagamento(pedido.getDataHoraPagamento())
				.observacao(pedido.getObservacao()).build();
	}

	public List<PedidoResponse> toResponseList(List<Pedido> pedidos) {
		if (pedidos == null) {
			return null;
		}
		return pedidos.stream().map(this::toResponse).collect(Collectors.toList());
	}

	public PedidoResponse toResponseWithoutComanda(Pedido pedido) {
		return toResponse(pedido);
	}
}