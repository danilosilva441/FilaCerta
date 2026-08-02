package com.filacerta.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.hibernate.annotations.CreationTimestamp;

import com.filacerta.domain.enums.StatusCaixa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "caixa_diario")
@Data
@NoArgsConstructor
public class CaixaDiario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private LocalDate data;

	@Column(name = "hora_abertura", nullable = false)
	private LocalTime horaAbertura;

	@Column(name = "hora_fechamento")
	private LocalTime horaFechamento;

	@Column(name = "hora_pausa")
	private LocalTime horaPausa;

	@Column(name = "hora_reativacao")
	private LocalTime horaReativacao;

	@Column(name = "motivo_pausa", length = 200)
	private String motivoPausa;

	@Column(name = "valor_inicial", nullable = false, precision = 10, scale = 2)
	private BigDecimal valorInicial = BigDecimal.ZERO;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private StatusCaixa status = StatusCaixa.ABERTO;

	@Column(name = "total_dinheiro", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalDinheiro = BigDecimal.ZERO;

	@Column(name = "total_debito", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalDebito = BigDecimal.ZERO;

	@Column(name = "total_credito", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalCredito = BigDecimal.ZERO;

	@Column(name = "total_pix", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalPix = BigDecimal.ZERO;

	@Column(name = "total_fiado", nullable = false, precision = 10, scale = 2)
	private BigDecimal totalFiado = BigDecimal.ZERO;

	@Column(name = "total_pedidos", nullable = false)
	private Integer totalPedidos = 0;

	@Column(name = "total_cancelados", nullable = false)
	private Integer totalCancelados = 0;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "total_concluidos", nullable = false)
	private Integer totalConcluidos = 0; // ← NOVO

	@Column(name = "valor_total_concluidos", nullable = false, precision = 10, scale = 2)
	private BigDecimal valorTotalConcluidos = BigDecimal.ZERO; // ← NOVO

	// Métodos auxiliares
	public boolean isAtendendo() {
		return this.status == StatusCaixa.ABERTO;
	}

	public boolean isPausado() {
		return this.status == StatusCaixa.PAUSADO;
	}

	public boolean isFechado() {
		return this.status == StatusCaixa.FECHADO;
	}

	public BigDecimal getTotalGeral() {
		return totalDinheiro.add(totalDebito).add(totalCredito).add(totalPix).add(totalFiado);
	}

	@Column(name = "tempo_estimado_retorno", length = 50)
	private String tempoEstimadoRetorno; // "30 minutos", "10 minutos", etc

}