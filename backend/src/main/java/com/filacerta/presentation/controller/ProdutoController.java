package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.service.ProdutoService;
import com.filacerta.domain.enums.CategoriaProduto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "API para gerenciamento de produtos")
public class ProdutoController {

	private final ProdutoService produtoService;

	@GetMapping
	@Operation(summary = "Listar todos os produtos")
	public ResponseEntity<List<ProdutoResponse>> listarTodos() {
		List<ProdutoResponse> response = produtoService.listarTodosProdutos();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/disponiveis")
	@Operation(summary = "Listar produtos disponíveis")
	public ResponseEntity<List<ProdutoResponse>> listarDisponiveis() {
		List<ProdutoResponse> response = produtoService.listarProdutosDisponiveis();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/categoria/{categoria}")
	@Operation(summary = "Listar produtos por categoria")
	public ResponseEntity<List<ProdutoResponse>> listarPorCategoria(@PathVariable CategoriaProduto categoria) {
		List<ProdutoResponse> response = produtoService.listarProdutosPorCategoria(categoria);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/{id}")
	@Operation(summary = "Buscar produto por ID")
	public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
		ProdutoResponse response = produtoService.buscarProdutoPorId(id);
		return ResponseEntity.ok(response);
	}
}