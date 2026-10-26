package com.filacerta.presentation.controller;

import java.io.ObjectInputFilter.Status;
import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AlterarSenhaRequest;
import com.filacerta.application.dto.request.CriarUsuarioRequest;
import com.filacerta.application.dto.response.UsuarioResponse;
import com.filacerta.application.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

	private final UsuarioService usuarioService;

	// ---> BLOQUEIO ATIVADO: Apenas VOCÊ pode chamar esta rota <---
	@PostMapping
	@PreAuthorize("hasAuthority('ADMIN')")
	public ResponseEntity<UsuarioResponse> criarUsuario(@RequestBody @Valid CriarUsuarioRequest request) {

		UsuarioResponse novoUsuario = usuarioService.criarUsuarioManualmente(request.getUsername(),
				request.getPassword(), request.getRole());

		return ResponseEntity.ok(novoUsuario);
	}

	// Já a rota de alterar senha, qualquer pessoa logada pode usar (para alterar a
	// PRÓPRIA senha)
	@PutMapping("/senha")
	public ResponseEntity<Void> alterarSenha(@RequestBody @Valid AlterarSenhaRequest request, Principal principal) {

		// Proteção extra contra NullPointerException
		if (principal == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		// O getName() pega o username com segurança
		String usernameLogado = principal.getName();

		usuarioService.alterarSenha(usernameLogado, request);

		return ResponseEntity.ok().build();
	}
}
