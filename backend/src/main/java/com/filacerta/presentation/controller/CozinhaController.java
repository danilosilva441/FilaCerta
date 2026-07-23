package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.service.PedidoService;
import com.filacerta.domain.enums.StatusPedido;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cozinha")
@RequiredArgsConstructor
@Tag(name = "Cozinha", description = "API para gerenciamento da fila da cozinha")
public class CozinhaController {

	private final PedidoService pedidoService;

	@GetMapping("/fila")
	@Operation(summary = "Buscar fila da cozinha", description = "Retorna todos os pedidos com status RECEBIDO e PREPARANDO, ordenados por data/hora")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Fila recuperada com sucesso"),
			@ApiResponse(responseCode = "500", description = "Erro interno do servidor") })
	public ResponseEntity<FilaCozinhaResponse> buscarFilaCozinha() {
		FilaCozinhaResponse response = pedidoService.buscarFilaCozinha();
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/pedidos/{id}/iniciar")
	@Operation(summary = "Iniciar preparo do pedido", description = "Altera o status do pedido de RECEBIDO para PREPARANDO")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido iniciado com sucesso"),
			@ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
			@ApiResponse(responseCode = "400", description = "Pedido não está no status RECEBIDO") })
	public ResponseEntity<PedidoResponse> iniciarPreparo(@PathVariable Long id) {
		PedidoResponse response = pedidoService.atualizarStatusPedido(id, StatusPedido.PREPARANDO);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/pedidos/{id}/pronto")
	@Operation(summary = "Marcar pedido como pronto", description = "Altera o status do pedido de PREPARANDO para PRONTO")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido marcado como pronto"),
			@ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
			@ApiResponse(responseCode = "400", description = "Pedido não está no status PREPARANDO") })
	public ResponseEntity<PedidoResponse> marcarPronto(@PathVariable Long id) {
		PedidoResponse response = pedidoService.atualizarStatusPedido(id, StatusPedido.PRONTO);
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/pedidos/{id}/entregar")
	@Operation(summary = "Entregar pedido", description = "Altera o status do pedido de PRONTO para ENTREGUE")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedido entregue com sucesso"),
			@ApiResponse(responseCode = "404", description = "Pedido não encontrado"),
			@ApiResponse(responseCode = "400", description = "Pedido não está no status PRONTO") })
	public ResponseEntity<PedidoResponse> entregarPedido(@PathVariable Long id) {
		PedidoResponse response = pedidoService.atualizarStatusPedido(id, StatusPedido.ENTREGUE);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/pedidos/status/{status}")
	@Operation(summary = "Listar pedidos por status específico", description = "Retorna todos os pedidos com o status informado")
	public ResponseEntity<List<PedidoResponse>> listarPedidosPorStatus(@PathVariable StatusPedido status) {
		List<PedidoResponse> response = pedidoService.listarPedidosPorStatus(status);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/pedidos")
	@Operation(summary = "Listar todos os pedidos da cozinha", description = "Retorna todos os pedidos com status RECEBIDO, PREPARANDO e PRONTO")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Pedidos listados com sucesso") })
	public ResponseEntity<List<PedidoResponse>> listarPedidosCozinha() {
		List<StatusPedido> statuses = List.of(StatusPedido.RECEBIDO, StatusPedido.PREPARANDO, StatusPedido.PRONTO);
		// TODO: Implementar método no service para buscar por múltiplos status
		return ResponseEntity.ok(null);
	}

	@GetMapping("/pedidos/em-andamento")
	@Operation(summary = "Listar pedidos em andamento", description = "Retorna todos os pedidos com status PREPARANDO")
	public ResponseEntity<List<PedidoResponse>> listarPedidosEmAndamento() {
		List<PedidoResponse> response = pedidoService.listarPedidosPorStatus(StatusPedido.PREPARANDO);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/pedidos/aguardando")
	@Operation(summary = "Listar pedidos aguardando preparo", description = "Retorna todos os pedidos com status RECEBIDO")
	public ResponseEntity<List<PedidoResponse>> listarPedidosAguardando() {
		List<PedidoResponse> response = pedidoService.listarPedidosPorStatus(StatusPedido.RECEBIDO);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/pedidos/prontos")
	@Operation(summary = "Listar pedidos prontos para entrega", description = "Retorna todos os pedidos com status PRONTO")
	public ResponseEntity<List<PedidoResponse>> listarPedidosProntos() {
		List<PedidoResponse> response = pedidoService.listarPedidosPorStatus(StatusPedido.PRONTO);
		return ResponseEntity.ok(response);
	}
}