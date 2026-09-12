package com.filacerta.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.MetodoPagamento;
import com.filacerta.domain.enums.OrigemPedido;
import com.filacerta.domain.enums.StatusItemPedido;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.enums.TipoPedido;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pedidos")
public class Pedido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Integer numero;

	@Column(name = "nome_cliente", nullable = false, length = 100)
	private String nomeCliente;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private TipoPedido tipo;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private OrigemPedido origem;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private StatusPedido status = StatusPedido.RECEBIDO;

	@Enumerated(EnumType.STRING)
	@Column(name = "status_pagamento", length = 20)
	@Builder.Default
	private StatusPagamento statusPagamento = StatusPagamento.AGUARDANDO;

	@Enumerated(EnumType.STRING)
	@Column(name = "metodo_pagamento", length = 20)
	private MetodoPagamento metodoPagamento;

	@Column(name = "valor_total", precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal valorTotal = BigDecimal.ZERO;

	@Column(name = "data_hora_pedido", nullable = false)
	private LocalDateTime dataHoraPedido;

	@Column(name = "data_hora_pronto")
	private LocalDateTime dataHoraPronto;

	@Column(length = 300)
	private String observacao;

	@OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	@Builder.Default
	private List<ItemPedido> itens = new ArrayList<>();

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "caixa_diario_id")
	@JsonBackReference
	private CaixaDiario caixaDiario;

	@Enumerated(EnumType.STRING)
	private FormaPagamento formaPagamento;

	// Não esqueça de gerar o Getter e Setter para formaPagamento!
	public FormaPagamento getFormaPagamento() {
		return formaPagamento;
	}

	public void setFormaPagamento(FormaPagamento formaPagamento) {
		this.formaPagamento = formaPagamento;
	}

	public void calcularValorTotal() {
		this.valorTotal = itens.stream()
				.map(item -> item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())))
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	public boolean todosItensProntos() {
		return itens.stream().allMatch(item -> item.getStatus() == StatusItemPedido.PRONTO);
	}
}