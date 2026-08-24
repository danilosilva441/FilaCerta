package com.filacerta.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AbrirCaixaRequest;
import com.filacerta.application.dto.response.CaixaDiarioResponse;
import com.filacerta.application.service.CaixaDiarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caixa-diario")
@Tag(name = "Caixa Diário", description = "Abertura e fechamento de caixa")
@RequiredArgsConstructor
public class CaixaDiarioController {

	private final CaixaDiarioService caixaService;

	@GetMapping("/atual")
	@Operation(summary = "Buscar o status do caixa atual")
	public ResponseEntity<CaixaDiarioResponse> buscarCaixaAtual() {
		CaixaDiarioResponse response = caixaService.buscarCaixaAtual();
		return response != null ? ResponseEntity.ok(response) : ResponseEntity.noContent().build();
	}

	@PostMapping("/abrir")
	@Operation(summary = "Abrir um novo caixa")
	public ResponseEntity<CaixaDiarioResponse> abrirCaixa(@RequestBody @Valid AbrirCaixaRequest request) {
		return ResponseEntity.ok(caixaService.abrirCaixa(request.getValorInicial()));
	}

	@PostMapping("/fechar")
	@Operation(summary = "Fechar o caixa atual")
	public ResponseEntity<CaixaDiarioResponse> fecharCaixa() {
		return ResponseEntity.ok(caixaService.fecharCaixa());
	}
}