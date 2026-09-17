package com.filacerta.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.filacerta.application.dto.request.ProdutoRequest;
import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.service.ProdutoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produtos")
@Tag(name = "Produtos", description = "Gerenciamento de Cardápio (CRUD)")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    @Operation(summary = "Listar produtos (com filtro opcional por categoria)")
    public ResponseEntity<List<ProdutoResponse>> listar(@RequestParam(required = false) Long categoriaId) {
        // Agora usamos o listar(), e não o listarPaginado()!
        return ResponseEntity.ok(produtoService.listar(categoriaId));
    }

    @PostMapping
    @Operation(summary = "Criar novo produto")
    public ResponseEntity<ProdutoResponse> criar(@RequestBody @Valid ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.criar(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um produto existente (inclui edição rápida de estoque)")
    public ResponseEntity<ProdutoResponse> atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Inativar um produto (Remove da visão do cliente)")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        produtoService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}