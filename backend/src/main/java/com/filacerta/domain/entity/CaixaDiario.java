package com.filacerta.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.filacerta.domain.enums.MotivoPausa;
import com.filacerta.domain.enums.StatusCaixa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
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
@Table(name = "caixa_diario")
public class CaixaDiario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private LocalDate data;

	@Column(name = "hora_abertura", nullable = false)
	private LocalDateTime horaAbertura;

	@Column(name = "hora_fechamento")
	private LocalDateTime horaFechamento;
	
	@Column(name = "data_fechamento")
	private LocalDateTime dataFechamento;

	@Column(name = "valor_inicial", precision = 10, scale = 2)
	private BigDecimal valorInicial;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private StatusCaixa status = StatusCaixa.FECHADO; // ABERTO ou FECHADO

	@Column(name = "total_dinheiro")
	private BigDecimal totalDinheiro;

	@Column(name = "total_pedidos")
	private Integer totalPedidos;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "cozinha_pausada")
	@Builder.Default
	private Boolean cozinhaPausada = false;
	
	@Enumerated(EnumType.STRING)
	@Column(name = "motivo_pausa")
	private MotivoPausa motivoPausa;

	@PrePersist
	protected void onCreate() {
		this.createdAt = LocalDateTime.now();
		if (this.totalDinheiro == null)
			this.totalDinheiro = BigDecimal.ZERO;
		if (this.totalPedidos == null)
			this.totalPedidos = 0;
	}

}