package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.CriarComandaRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.application.service.ComandaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comandas")
@RequiredArgsConstructor
@Tag(name = "Comandas", description = "API para gerenciamento de comandas")
public class ComandaController {

	private final ComandaService comandaService;

	@PostMapping
	@Operation(summary = "Criar nova comanda")
	public ResponseEntity<ComandaResponse> criarComanda(@Valid @RequestBody CriarComandaRequest request) {
		ComandaResponse response = comandaService.criarComanda(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Buscar comanda por ID")
	public ResponseEntity<ComandaResponse> buscarPorId(@PathVariable Long id) {
		ComandaResponse response = comandaService.buscarComandaPorId(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/codigo/{codigo}")
	@Operation(summary = "Buscar comanda por código")
	public ResponseEntity<ComandaResponse> buscarPorCodigo(@PathVariable String codigo) {
		ComandaResponse response = comandaService.buscarComandaPorCodigo(codigo);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/abertas")
	@Operation(summary = "Listar comandas abertas")
	public ResponseEntity<List<ComandaResponse>> listarAbertas() {
		List<ComandaResponse> response = comandaService.listarComandasAbertas();
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{id}/fechar")
	@Operation(summary = "Fechar comanda")
	public ResponseEntity<ComandaResponse> fecharComanda(@PathVariable Long id) {
		ComandaResponse response = comandaService.fecharComanda(id);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{comandaId}/pedidos/{pedidoId}")
	@Operation(summary = "Adicionar pedido à comanda")
	public ResponseEntity<ComandaResponse> adicionarPedido(@PathVariable Long comandaId, @PathVariable Long pedidoId) {
		ComandaResponse response = comandaService.adicionarPedidoComanda(comandaId, pedidoId);
		return ResponseEntity.ok(response);
	}
}