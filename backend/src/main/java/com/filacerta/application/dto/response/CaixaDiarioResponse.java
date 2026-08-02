package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaixaDiarioResponse {
	private Long id;
	private LocalDate data;
	private LocalTime horaAbertura;
	private LocalTime horaFechamento;
	private LocalTime horaPausa;
	private LocalTime horaReativacao;
	private String motivoPausa;
	private String tempoEstimadoRetorno;
	private BigDecimal valorInicial;
	private String status;

	// TOTAIS POR PAGAMENTO
	private BigDecimal totalDinheiro;
	private BigDecimal totalDebito;
	private BigDecimal totalCredito;
	private BigDecimal totalPix;
	private BigDecimal totalFiado;
	private BigDecimal totalGeral;

	// CONTAGENS
	private Integer totalPedidos;
	private Integer totalCancelados;
	private Integer totalConcluidos;
	private BigDecimal valorTotalConcluidos;

	private LocalDateTime createdAt;
}