package com.filacerta.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	private String token;
	private String codigoCliente;
	private String nomeCliente;
	private String tipo;
	private Boolean success;
	private String message;
}