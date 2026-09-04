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
}