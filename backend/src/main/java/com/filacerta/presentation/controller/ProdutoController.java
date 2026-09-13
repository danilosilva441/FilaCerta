package com.filacerta.presentation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.filacerta.application.dto.request.ProdutoRequest;
import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.service.ProdutoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.net.URI;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<Page<ProdutoResponse>> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 12, sort = "nome") Pageable pageable) {

        Page<ProdutoResponse> page = produtoService.listarPaginado(categoriaId, nome, pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> inserir(@Valid @RequestBody ProdutoRequest dto) {
        ProdutoResponse response = produtoService.inserir(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(response.getId()).toUri();
        return ResponseEntity.created(uri).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}