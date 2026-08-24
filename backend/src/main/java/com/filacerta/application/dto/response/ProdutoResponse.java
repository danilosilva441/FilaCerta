package com.filacerta.application.dto.response;

import com.filacerta.domain.enums.CategoriaProduto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProdutoResponse {
    private Long id;
    private String nome;
    private String descricao;
    private BigDecimal preco;
    private CategoriaProduto categoria;
    private Integer tempoPreparoMinutos;
}