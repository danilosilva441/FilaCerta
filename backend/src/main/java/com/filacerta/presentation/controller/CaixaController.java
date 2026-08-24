package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AtualizarPagamentoRequest;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.service.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caixa")
@Tag(name = "Caixa", description = "Operações do balcão e pagamentos")
@RequiredArgsConstructor
public class CaixaController {

	private final PedidoService pedidoService;

	@GetMapping("/pagamentos-pendentes")
	@Operation(summary = "Listar pedidos aguardando pagamento")
	public ResponseEntity<List<PedidoResponse>> listarPendentes() {
		return ResponseEntity.ok(pedidoService.listarPedidoPagamentoPendente());
	}

	@PatchMapping("/pedidos/{id}/pagamento")
	@Operation(summary = "Atualizar status de pagamento do pedido")
	public ResponseEntity<Void> atualizarPagamento(@PathVariable Long id,
			@RequestBody @Valid AtualizarPagamentoRequest request) {

		pedidoService.atualizarStatusPagamento(id, request.getStatusPagamento());
		return ResponseEntity.ok().build();
	}
}