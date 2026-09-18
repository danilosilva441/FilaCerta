package com.filacerta.application.dto.response;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProdutoResponse {
    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private String categoria;
    private Integer tempoPreparoMinutos;
    private Integer quantidadeDisponivel;
    private Boolean disponivel;
    private boolean ativo;
    private Integer versao;
}