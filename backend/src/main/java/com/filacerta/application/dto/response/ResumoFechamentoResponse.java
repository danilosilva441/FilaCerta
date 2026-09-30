package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResumoFechamentoResponse {
    private Long caixaId;
    private LocalDateTime dataFechamento;
    private BigDecimal valorInicialTroco;
    private BigDecimal totalPix;
    private BigDecimal totalCartao;
    private BigDecimal totalDinheiro;
    private BigDecimal faturamentoTotal;
    private BigDecimal totalEmGaveta; // Troco Inicial + Vendas em Dinheiro
    private Integer quantidadeCancelados;
    private BigDecimal valorCancelado;
    
 // NOVOS CONTADORES DE TRANSAÇÕES
    private Integer qtdPix;
    private Integer qtdCartao;
    private Integer qtdDinheiro;

    // NOVOS CONTADORES GERAIS DE PEDIDOS
    private Integer totalPedidos;
    private Integer totalConcluidos;
    private Integer totalCancelados;
}