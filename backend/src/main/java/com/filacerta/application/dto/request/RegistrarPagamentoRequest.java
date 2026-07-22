package com.filacerta.application.dto.request;

import com.filacerta.domain.enums.MetodoPagamento;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarPagamentoRequest {

	@NotNull(message = "Método de pagamento é obrigatório")
	private MetodoPagamento metodoPagamento;
}