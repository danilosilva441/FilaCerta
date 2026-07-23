package com.filacerta.application.dto.request;

import java.util.ArrayList;
import java.util.List;

import com.filacerta.domain.enums.OrigemPedido;
import com.filacerta.domain.enums.TipoPedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarPedidoRequest {

	@NotBlank(message = "Nome do cliente é obrigatório")
	@Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
	private String nomeCliente;

	@NotNull(message = "Tipo do pedido é obrigatório")
	private TipoPedido tipo;

	@NotNull(message = "Origem do pedido é obrigatória")
	private OrigemPedido origem;

	@NotNull(message = "Itens do pedido são obrigatórios")
	@Valid
	private List<ItemPedidoRequest> itens = new ArrayList<>();

	@Size(max = 300, message = "Observação deve ter no máximo 300 caracteres")
	private String observacao;

	// Getters e Setters explícitos (caso o Lombok não esteja funcionando)
	public String getNomeCliente() {
		return nomeCliente;
	}

	public void setNomeCliente(String nomeCliente) {
		this.nomeCliente = nomeCliente;
	}

	public TipoPedido getTipo() {
		return tipo;
	}

	public void setTipo(TipoPedido tipo) {
		this.tipo = tipo;
	}

	public OrigemPedido getOrigem() {
		return origem;
	}

	public void setOrigem(OrigemPedido origem) {
		this.origem = origem;
	}

	public List<ItemPedidoRequest> getItens() {
		return itens;
	}

	public void setItens(List<ItemPedidoRequest> itens) {
		this.itens = itens;
	}

	public String getObservacao() {
		return observacao;
	}

	public void setObservacao(String observacao) {
		this.observacao = observacao;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class ItemPedidoRequest {
		@NotNull(message = "ID do produto é obrigatório")
		private Long produtoId;

		@NotNull(message = "Quantidade é obrigatória")
		private Integer quantidade;

		@Size(max = 200, message = "Observação do item deve ter no máximo 200 caracteres")
		private String observacao;

		// Getters e Setters explícitos
		public Long getProdutoId() {
			return produtoId;
		}

		public void setProdutoId(Long produtoId) {
			this.produtoId = produtoId;
		}

		public Integer getQuantidade() {
			return quantidade;
		}

		public void setQuantidade(Integer quantidade) {
			this.quantidade = quantidade;
		}

		public String getObservacao() {
			return observacao;
		}

		public void setObservacao(String observacao) {
			this.observacao = observacao;
		}
	}
}