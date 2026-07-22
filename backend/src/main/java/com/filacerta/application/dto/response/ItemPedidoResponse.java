package com.filacerta.application.dto.response;

import java.math.BigDecimal;

import com.filacerta.domain.enums.StatusItemPedido;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedidoResponse {
	private Long id;
	private Long produtoId;
	private String nomeProduto;
	private String descricaoProduto;
	private Integer quantidade;
	private BigDecimal precoUnitario;
	private BigDecimal subtotal;
	private StatusItemPedido status;
	private String observacaoItem;
}