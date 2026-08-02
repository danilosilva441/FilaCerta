package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AtualizarItemRequest;
import com.filacerta.application.dto.request.AtualizarPedidoRequest;
import com.filacerta.application.dto.request.AtualizarStatusItemRequest;
import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.request.RegistrarPagamentoRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.service.PedidoService;
import com.filacerta.domain.enums.StatusPedido;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "API para gerenciamento de pedidos")
public class PedidoController {

	private final PedidoService pedidoService;

	@PostMapping
	@Operation(summary = "Criar novo pedido")
	@ApiResponses(value = { @ApiResponse(responseCode = "201", description = "Pedido criado com sucesso"),
			@ApiResponse(responseCode = "400", description = "Dados inválidos"),
			@ApiResponse(responseCode = "404", description = "Produto não encontrado") })
	public ResponseEntity<PedidoResponse> criarPedido(@Valid @RequestBody CriarPedidoRequest request,
			@RequestHeader(value = "Authorization", required = false) String authorization) {

		String token = null;
		if (authorization != null && authorization.startsWith("Bearer ")) {
			token = authorization.substring(7);
		}

		PedidoResponse response = pedidoService.criarPedido(request, token);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Buscar pedido por ID")
	public ResponseEntity<PedidoResponse> buscarPedido(@PathVariable Long id) {
		PedidoResponse response = pedidoService.buscarPedidoPorId(id);
		return ResponseEntity.ok(response);
	}

	@GetMapping
	@Operation(summary = "Listar pedidos por status")
	public ResponseEntity<List<PedidoResponse>> listarPedidos(@RequestParam(required = false) StatusPedido status) {
		List<PedidoResponse> response = pedidoService.listarPedidosPorStatus(status);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/{id}/status")
	@Operation(summary = "Atualizar status do pedido")
	public ResponseEntity<PedidoResponse> atualizarStatus(@PathVariable Long id, @RequestParam StatusPedido status) {
		PedidoResponse response = pedidoService.atualizarStatusPedido(id, status);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/{pedidoId}/itens/{itemId}")
	@Operation(summary = "Atualizar item do pedido")
	public ResponseEntity<PedidoResponse> atualizarItem(@PathVariable Long pedidoId, @PathVariable Long itemId,
			@Valid @RequestBody AtualizarItemRequest request) {
		// Este usa AtualizarItemRequest (quantidade/observacao)
		PedidoResponse response = pedidoService.atualizarItemPedido(pedidoId, itemId, request);
		return ResponseEntity.ok(response);
	}

	// Se for para atualizar status do item
	@PatchMapping("/{pedidoId}/itens/{itemId}/status")
	@Operation(summary = "Atualizar status item do pedido")
	public ResponseEntity<Void> atualizarStatusItem(@PathVariable Long pedidoId, @PathVariable Long itemId,
			@Valid @RequestBody AtualizarStatusItemRequest request) {
		// Este usa AtualizarStatusItemRequest (status)
		pedidoService.atualizarStatusItem(pedidoId, itemId, request.getStatus());
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/{pedidoId}/itens/{itemId}")
	@Operation(summary = "Remover item do pedido")
	public ResponseEntity<PedidoResponse> removerItem(@PathVariable Long pedidoId, @PathVariable Long itemId) {
		PedidoResponse response = pedidoService.removerItemPedido(pedidoId, itemId);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{id}/pagamento")
	@Operation(summary = "Registrar pagamento do pedido")
	public ResponseEntity<PedidoResponse> registrarPagamento(@PathVariable Long id,
			@Valid @RequestBody RegistrarPagamentoRequest request) {

		// Se for apenas visualizar, não confirma
		if (!request.getConfirmarPagamento()) {
			PedidoResponse response = pedidoService.visualizarPagamento(id, request);
			return ResponseEntity.ok(response);
		}

		// Se confirmar, processa o pagamento
		PedidoResponse response = pedidoService.registrarPagamento(id, request);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/fila/cozinha")
	@Operation(summary = "Buscar fila da cozinha")
	public ResponseEntity<FilaCozinhaResponse> buscarFilaCozinha() {
		FilaCozinhaResponse response = pedidoService.buscarFilaCozinha();
		return ResponseEntity.ok(response);
	}

	@PostMapping("/{id}/cancelar")
	@Operation(summary = "Cancelar pedido")
	public ResponseEntity<PedidoResponse> cancelarPedido(@PathVariable Long id) {
		PedidoResponse response = pedidoService.cancelarPedido(id);
		return ResponseEntity.ok(response);
	}

	/**
	 * PUT /api/pedidos/{id} Atualiza um pedido existente (nome, tipo, itens,
	 * observação)
	 */
	@PutMapping("/{id}")
	@Operation(summary = "Atualizar pedido existente")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido atualizado com sucesso"),
			@ApiResponse(responseCode = "400", description = "Dados inválidos"),
			@ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
			@ApiResponse(responseCode = "403", description = "Pedido não pode ser alterado") })
	public ResponseEntity<PedidoResponse> atualizarPedido(@PathVariable Long id,
			@Valid @RequestBody AtualizarPedidoRequest request) {
		PedidoResponse response = pedidoService.atualizarPedido(id, request);
		return ResponseEntity.ok(response);
	}
}