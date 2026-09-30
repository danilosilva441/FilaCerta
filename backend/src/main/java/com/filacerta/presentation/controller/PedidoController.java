package com.filacerta.presentation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.AtualizarPedidoRequest;
import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.service.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Gestão de pedidos")
@RequiredArgsConstructor
public class PedidoController {

	private final PedidoService pedidoService;

	@PostMapping
	@Operation(summary = "Criar novo pedido")
	public ResponseEntity<PedidoResponse> criar(@Valid @RequestBody CriarPedidoRequest request) {
		PedidoResponse response = pedidoService.criarPedido(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Buscar detalhes de um pedido pelo ID")
	public ResponseEntity<PedidoResponse> buscarPorId(@PathVariable Long id) {
		PedidoResponse response = pedidoService.buscarPorId(id);
		return ResponseEntity.ok(response);
	}
	
	@PatchMapping("/{id}/cancelar")
    // Se você usa Swagger/OpenAPI, pode deixar a linha do @Operation abaixo, senão pode apagar
    @Operation(summary = "Cancela um pedido (Arquivo Morto)") 
    public ResponseEntity<Void> cancelarPedido(@PathVariable Long id) {
        pedidoService.cancelarPedido(id);
        return ResponseEntity.ok().build();
    }
	
	@GetMapping("/rastreio/{codigo}")
    public ResponseEntity<PedidoResponse> acompanharPedido(@PathVariable String codigo) {
        return ResponseEntity.ok(pedidoService.buscarPorCodigo(codigo));
    }
	
	@PutMapping("/rastreio/{codigo}")
    public ResponseEntity<PedidoResponse> atualizarPedido(
            @PathVariable String codigo, 
            @RequestBody AtualizarPedidoRequest request) {
            
        return ResponseEntity.ok(pedidoService.atualizarPedido(codigo, request));
    }
}