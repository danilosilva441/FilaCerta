package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.filacerta.domain.enums.StatusCaixa;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CaixaDiarioResponse {
    private Long id;
    private LocalDate data;
    private LocalDateTime horaAbertura;
    private LocalDateTime horaFechamento;
    private BigDecimal valorInicial;
    private BigDecimal totalDinheiro;
    private Integer totalPedidos;
    private StatusCaixa status;
}