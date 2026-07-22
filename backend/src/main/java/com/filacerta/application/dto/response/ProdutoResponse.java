package com.filacerta.application.dto.response;

import java.math.BigDecimal;

import com.filacerta.domain.enums.CategoriaProduto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoResponse {
	private Long id;
	private String nome;
	private String descricao;
	private BigDecimal preco;
	private CategoriaProduto categoria;
	private Integer tempoPreparoMinutos;
	private Boolean disponivel;
}