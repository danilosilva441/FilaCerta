package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarItemRequest {

	@NotNull(message = "Quantidade é obrigatória")
	private Integer quantidade;

	private String observacao;
}