package com.filacerta.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusCaixaResponse {
    private String status;          // ABERTO, PAUSADO, FECHADO, NAO_ABERTO
    private String mensagem;         // Mensagem amigável
    private String mensagemDetalhada; // Mensagem mais detalhada
    private String icone;            // Emoji para o status
    private Boolean podePedir;       // true/false
    private LocalTime horaPausa;     // Horário que pausou
    private String motivoPausa;      // Motivo da pausa
    private String tempoEstimado;    // Tempo estimado de retorno (opcional)
}