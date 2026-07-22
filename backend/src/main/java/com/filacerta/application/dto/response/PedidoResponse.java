package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.filacerta.domain.enums.MetodoPagamento;
import com.filacerta.domain.enums.OrigemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.enums.TipoPedido;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {
	private Long id;
	private Integer numero;
	private String nomeCliente;
	private TipoPedido tipo;
	private OrigemPedido origem;
	private StatusPedido status;
	private StatusPagamento statusPagamento;
	private MetodoPagamento metodoPagamento;
	private BigDecimal valorTotal;
	private LocalDateTime dataHoraPedido;
	private LocalDateTime dataHoraPronto;
	private LocalDateTime dataHoraEntrega;
	private LocalDateTime dataHoraPagamento;
	private String observacao;
	private List<ItemPedidoResponse> itens;
	private ComandaResponse comanda;
}