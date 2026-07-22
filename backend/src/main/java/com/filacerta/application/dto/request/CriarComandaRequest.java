package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarComandaRequest {

	@NotBlank(message = "Nome do cliente é obrigatório")
	@Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
	private String nomeCliente;

	private Integer mesa;
}