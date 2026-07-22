package com.filacerta.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.filacerta.domain.enums.StatusCaixa;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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
    
    // Método para calcular total geral
    public BigDecimal getTotalGeral() {
        return totalDinheiro
            .add(totalDebito)
            .add(totalCredito)
            .add(totalPix)
            .add(totalFiado);
    }
}