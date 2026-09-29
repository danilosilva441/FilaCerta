package com.filacerta.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Lombok: Gera Getters, Setters, toString, equals e hashCode
@Builder // Lombok: Permite criar objetos com Produto.builder().nome("...").build()
@NoArgsConstructor // Lombok: Construtor vazio (exigência do JPA)
@AllArgsConstructor // Lombok: Construtor com todos os argumentos
@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "tempo_preparo_minutos", nullable = false)
    private Integer tempoPreparoMinutos;

    @Column(nullable = false)
    @Builder.Default
    private Boolean disponivel = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "quantidade_disponivel")
    private Integer quantidadeDisponivel;

    @Column(name = "limite_diario")
    private Integer limiteDiario;
    
    @Version
    private Integer versao = 0;

    @Column(name = "ativo", columnDefinition = "boolean default true")
    @Builder.Default
    private boolean ativo = true;

    // Callbacks do JPA para preencher as datas automaticamente
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.tempoPreparoMinutos == null) {
            this.tempoPreparoMinutos = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}