package com.filacerta.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarClienteRequest {

	@NotBlank(message = "Nome é obrigatório")
	@Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
	private String nome;

	@NotBlank(message = "Sobrenome é obrigatório")
	@Size(max = 100, message = "Sobrenome deve ter no máximo 100 caracteres")
	private String sobrenome;
}