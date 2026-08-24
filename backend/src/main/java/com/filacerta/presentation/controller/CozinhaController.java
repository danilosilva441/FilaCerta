package com.filacerta.presentation.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AtualizarItemRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.mapper.PedidoMapper;
import com.filacerta.application.service.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cozinha")
@Tag(name = "Cozinha", description = "Painel da cozinha")
@RequiredArgsConstructor
public class CozinhaController {

	private final PedidoService pedidoService;

	@GetMapping("/fila")
	@Operation(summary = "Listar fila de pedidos ativos para a cozinha")
	public ResponseEntity<List<FilaCozinhaResponse>> listarFila() {
		List<FilaCozinhaResponse> response = pedidoService.buscarFilaCozinha();
		return ResponseEntity.ok(response);
	}

	@PatchMapping("/pedidos/{pedidoId}/itens/{itemId}")
	@Operation(summary = "Atualizar o status de um item de um pedido na cozinha")
	public ResponseEntity<Void> atualizarItem(@PathVariable Long pedidoId, @PathVariable Long itemId,
			@RequestBody @Valid AtualizarItemRequest request) {

		pedidoService.atualizarStatusItem(pedidoId, itemId, request.getStatus());
		return ResponseEntity.ok().build();
	}
}