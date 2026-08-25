package com.filacerta.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
}