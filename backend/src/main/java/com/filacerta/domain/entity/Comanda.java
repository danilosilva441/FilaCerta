package com.filacerta.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.filacerta.domain.enums.StatusComanda;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comanda")
@Data
@NoArgsConstructor
public class Comanda {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;
    
    @Column(name = "nome_cliente", nullable = false, length = 100)
    private String nomeCliente;
    
    private Integer mesa;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusComanda status = StatusComanda.ABERTA;
    
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private LocalDateTime abertura = LocalDateTime.now();
    
    private LocalDateTime fechamento;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "comanda", cascade = CascadeType.ALL)
    private List<ComandaPedido> comandaPedidos = new ArrayList<>();
}