package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.enums.TipoPedido;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PedidoResponse {
    private Long id;
    private Integer numero;
    private String nomeCliente;
    private TipoPedido tipo;
    private StatusPedido status;
    private StatusPagamento statusPagamento;
    private BigDecimal valorTotal;
    private LocalDateTime dataHoraPedido;
    private List<ItemPedidoResponse> itens;
}