package com.filacerta.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.filacerta.domain.enums.MetodoPagamento;
import com.filacerta.domain.enums.OrigemPedido;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pedido")
@Data
@NoArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer numero;
    
    @Column(name = "nome_cliente", nullable = false, length = 100)
    private String nomeCliente;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPedido tipo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrigemPedido origem;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.RECEBIDO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", nullable = false)
    private StatusPagamento statusPagamento = StatusPagamento.AGUARDANDO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento")
    private MetodoPagamento metodoPagamento;
    
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;
    
    @Column(name = "data_hora_pedido", nullable = false)
    private LocalDateTime dataHoraPedido = LocalDateTime.now();
    
    @Column(name = "data_hora_pronto")
    private LocalDateTime dataHoraPronto;
    
    @Column(name = "data_hora_entrega")
    private LocalDateTime dataHoraEntrega;
    
    @Column(name = "data_hora_pagamento")
    private LocalDateTime dataHoraPagamento;
    
    @Column(length = 300)
    private String observacao;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "caixa_diario_data", nullable = false)
    private LocalDateTime caixaDiarioData = LocalDateTime.now();
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemPedido> itens = new ArrayList<>();
    
    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private ComandaPedido comandaPedido;
    
    // Método para calcular valor total
    public BigDecimal calcularValorTotal() {
        return itens.stream()
            .map(item -> item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}