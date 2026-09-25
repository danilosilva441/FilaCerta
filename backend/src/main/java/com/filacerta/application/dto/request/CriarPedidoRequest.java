package com.filacerta.application.dto.request;

import java.util.List;

import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.OrigemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.TipoPedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CriarPedidoRequest {

    @NotBlank(message = "Nome do cliente é obrigatório")
    @Size(min = 2, max = 50, message = "Nome deve ter entre 2 e 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\s]*$", message = "O nome contém caracteres inválidos")
    private String nomeCliente;

    @NotNull(message = "Tipo de pedido é obrigatório")
    private TipoPedido tipo;

    @NotNull(message = "Origem é obrigatória")
    private OrigemPedido origem;

    @NotEmpty(message = "Pedido deve conter pelo menos 1 item")
    @Valid
    private List<ItemPedidoRequest> itens;

    private String observacao;
    
    private StatusPagamento statusPagamento;
    
 // Adicione o campo:
    private FormaPagamento formaPagamento;

    // Adicione o Getter e Setter
    public FormaPagamento getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(FormaPagamento formaPagamento) {
        this.formaPagamento = formaPagamento;
    }
}