package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProdutoRequest {

    @NotBlank(message = "O nome do produto é obrigatório")
    private String nome;

    private String descricao;

    @NotNull(message = "O preço é obrigatório")
    @PositiveOrZero(message = "O preço não pode ser negativo")
    private BigDecimal preco;

    @NotNull(message = "O ID da categoria é obrigatório")
    private Long categoriaId;

    @PositiveOrZero(message = "O tempo de preparo não pode ser negativo")
    private Integer tempoPreparoMinutos;

    // Faltava este campo para o botão de "Pausar Produto":
    private Boolean disponivel = true;

    // Campos opcionais para o controle de estoque
    @PositiveOrZero(message = "A quantidade disponível não pode ser negativa")
    private Integer quantidadeDisponivel;

    @PositiveOrZero(message = "O limite diário não pode ser negativo")
    private Integer limiteDiario;
    
    private Integer versao;
}