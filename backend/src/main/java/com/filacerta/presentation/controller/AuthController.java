package com.filacerta.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.CriarClienteRequest;
import com.filacerta.application.dto.request.LoginRequest;
import com.filacerta.application.dto.response.AuthResponse;
import com.filacerta.application.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "API para autenticação de clientes e usuários")
public class AuthController {

	private final AuthService authService;

	// ===== CLIENTE =====

	@PostMapping("/cliente/registrar")
	@Operation(summary = "Registrar novo cliente")
	public ResponseEntity<AuthResponse> registrarCliente(@Valid @RequestBody CriarClienteRequest request) {
		AuthResponse response = authService.registrarCliente(request);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/cliente/login")
	@Operation(summary = "Login do cliente (usando código)")
	public ResponseEntity<AuthResponse> loginCliente(@RequestParam String codigo) {
		AuthResponse response = authService.loginCliente(codigo);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/cliente/logout")
	@Operation(summary = "Logout do cliente")
	public ResponseEntity<AuthResponse> logoutCliente(@RequestHeader("Authorization") String token) {
		// Remove "Bearer " do token
		String tokenClean = token.replace("Bearer ", "");
		authService.logoutCliente(tokenClean);
		return ResponseEntity.ok(AuthResponse.builder().success(true).message("Logout realizado com sucesso!").build());
	}

	@GetMapping("/cliente/validar")
	@Operation(summary = "Validar sessão do cliente")
	public ResponseEntity<AuthResponse> validarSessao(@RequestHeader("Authorization") String token) {
		String tokenClean = token.replace("Bearer ", "");
		AuthResponse response = authService.validarSessao(tokenClean);
		return ResponseEntity.ok(response);
	}

	// ===== USUÁRIO =====

	@PostMapping("/usuario/login")
	@Operation(summary = "Login do usuário (dono/funcionário)")
	public ResponseEntity<AuthResponse> loginUsuario(@Valid @RequestBody LoginRequest request) {
		AuthResponse response = authService.loginUsuario(request);
		return ResponseEntity.ok(response);
	}
}