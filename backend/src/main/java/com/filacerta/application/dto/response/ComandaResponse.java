package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.filacerta.domain.enums.StatusComanda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComandaResponse {
	private Long id;
	private String codigo;
	private String nomeCliente;
	private Integer mesa;
	private StatusComanda status;
	private BigDecimal valorTotal;
	private LocalDateTime abertura;
	private LocalDateTime fechamento;
	private List<Long> pedidoIds;
}