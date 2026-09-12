package com.filacerta.application.dto.response;

import java.math.BigDecimal;

import com.filacerta.domain.entity.Categoria;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProdutoResponse {
    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private Categoria categoria;
    private Integer tempoPreparoMinutos;
}