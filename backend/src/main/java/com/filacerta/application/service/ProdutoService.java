package com.filacerta.application.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.mapper.ProdutoMapper;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.CategoriaProduto;
import com.filacerta.domain.exception.ProdutoNaoEncontradoException;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutoMapper produtoMapper;

    public List<ProdutoResponse> listarTodosProdutos() {
        log.info("Listando todos os produtos");
        try {
            List<Produto> produtos = produtoRepository.findAll();
            log.info("Encontrados {} produtos", produtos.size());
            
            if (produtos.isEmpty()) {
                log.warn("Nenhum produto encontrado no banco");
                return List.of();
            }
            
            return produtos.stream()
                .map(produtoMapper::toResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao listar produtos", e);
            throw e;
        }
    }

    public List<ProdutoResponse> listarProdutosPorCategoria(CategoriaProduto categoria) {
        log.info("Listando produtos da categoria: {}", categoria);
        try {
            List<Produto> produtos = produtoRepository.findByCategoriaAndDisponivelTrueOrderByNomeAsc(categoria);
            log.info("Encontrados {} produtos na categoria {}", produtos.size(), categoria);
            return produtos.stream()
                .map(produtoMapper::toResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao listar produtos por categoria", e);
            throw e;
        }
    }

    public List<ProdutoResponse> listarProdutosDisponiveis() {
        log.info("Listando produtos disponíveis");
        try {
            List<Produto> produtos = produtoRepository.findByDisponivelTrueOrderByCategoriaAscNomeAsc();
            log.info("Encontrados {} produtos disponíveis", produtos.size());
            return produtos.stream()
                .map(produtoMapper::toResponse)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao listar produtos disponíveis", e);
            throw e;
        }
    }

    public ProdutoResponse buscarProdutoPorId(Long id) {
        log.info("Buscando produto com ID: {}", id);
        try {
            Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
            log.info("Produto encontrado: {}", produto.getNome());
            return produtoMapper.toResponse(produto);
        } catch (ProdutoNaoEncontradoException e) {
            log.error("Produto não encontrado: {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao buscar produto", e);
            throw e;
        }
    }
}