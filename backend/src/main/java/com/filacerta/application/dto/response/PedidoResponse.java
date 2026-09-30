package com.filacerta.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.enums.TipoPedido;

import lombok.Builder;
import lombok.Data;

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
    private String codigoAcompanhamento;
    
 // Adicione o campo:
    private String formaPagamento;

    // Adicione o Getter e Setter
    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}