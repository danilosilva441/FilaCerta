package com.filacerta.application.mapper;

import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.domain.entity.CaixaDiario;

public class CaixaMapper {

    public static CaixaDiarioResponse toResponse(CaixaDiario caixa) {
        if (caixa == null) return null;

        return CaixaDiarioResponse.builder()
                .id(caixa.getId())
                .data(caixa.getData())
                .horaAbertura(caixa.getHoraAbertura())
                .horaFechamento(caixa.getHoraFechamento())
                .valorInicial(caixa.getValorInicial())
                .totalDinheiro(caixa.getTotalDinheiro())
                .totalPedidos(caixa.getTotalPedidos())
                .status(caixa.getStatus())
                // AGORA LÊ CORRETAMENTE A COLUNA BOOLEANA DO BANCO:
                .cozinhaPausada(caixa.getCozinhaPausada() != null && caixa.getCozinhaPausada())
                .motivoPausa(caixa.getMotivoPausa())
                .build();
    }
}