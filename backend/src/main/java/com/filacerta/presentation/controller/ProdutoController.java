package com.filacerta.presentation.controller;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.mapper.ProdutoMapper;
import com.filacerta.application.service.ProdutoService;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.CategoriaProduto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/produtos")
@Tag(name = "Produtos", description = "Catálogo de produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    @Operation(summary = "Listar todos os produtos disponíveis")
    public ResponseEntity<List<ProdutoResponse>> listar(
            @RequestParam(required = false) CategoriaProduto categoria) {

        List<Produto> produtos;
        if (categoria != null) {
            produtos = produtoService.listarPorCategoria(categoria);
        } else {
            produtos = produtoService.listarTodos();
        }

        List<ProdutoResponse> response = produtos.stream()
            .map(ProdutoMapper::toResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}