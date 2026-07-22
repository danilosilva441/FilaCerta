package com.filacerta.application.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilaCozinhaResponse {
	private Integer totalPedidos;
	private List<PedidoResumidoResponse> pedidos;

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class PedidoResumidoResponse {
		private Long id;
		private Integer numero;
		private String nomeCliente;
		private LocalDateTime dataHoraPedido;
		private Integer tempoEsperaMinutos;
		private List<ItemResumidoResponse> itens;
	}

	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ItemResumidoResponse {
		private String nomeProduto;
		private Integer quantidade;
		private String status;
	}
}