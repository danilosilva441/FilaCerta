package com.filacerta.presentation.controller;

import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.service.CaixaDiarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caixa")
@RequiredArgsConstructor
@Tag(name = "Caixa", description = "API para gerenciamento de caixa diário")
public class CaixaController {

	private final CaixaDiarioService caixaDiarioService;

	@PostMapping("/abrir")
	@Operation(summary = "Abrir caixa do dia")
	public ResponseEntity<Void> abrirCaixa() {
		caixaDiarioService.abrirCaixa();
		return ResponseEntity.ok().build();
	}

	@PostMapping("/fechar")
	@Operation(summary = "Fechar caixa do dia")
	public ResponseEntity<Void> fecharCaixa() {
		caixaDiarioService.fecharCaixa();
		return ResponseEntity.ok().build();
	}

	@GetMapping("/hoje")
	@Operation(summary = "Buscar caixa do dia atual")
	public ResponseEntity<Object> buscarCaixaHoje() {
		Object response = caixaDiarioService.buscarCaixaDoDia();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{data}")
	@Operation(summary = "Buscar caixa por data")
	public ResponseEntity<Object> buscarCaixaPorData(@PathVariable String data) {
		LocalDate date = LocalDate.parse(data);
		Object response = caixaDiarioService.buscarCaixaPorData(date);
		return ResponseEntity.ok(response);
	}
}