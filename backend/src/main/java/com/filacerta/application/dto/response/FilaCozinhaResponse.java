package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.StatusPedido;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class FilaCozinhaResponse {
    private Long pedidoId;
    private Integer numero;
    private String nomeCliente;
    private List<ItemCozinhaResponse> itens;
    private StatusPedido status;
    private LocalDateTime dataHoraPedido;
    private String tempoEspera;
}