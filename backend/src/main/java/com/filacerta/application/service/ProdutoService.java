package com.filacerta.application.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.ProdutoRequest;
import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.mapper.ProdutoMapper;
import com.filacerta.domain.entity.Categoria;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.CategoriaRepository;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public Page<ProdutoResponse> listarPaginado(Long categoriaId, String nome, Pageable pageable) {
        Page<Produto> page = produtoRepository.buscarFiltrado(categoriaId, nome, pageable);
        return page.map(ProdutoMapper::toResponse);
    }

    // NOVO: Lista simples sem paginação (usada pelo cardápio e painel)
    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar(Long categoriaId) {
        List<Produto> produtos = produtoRepository.findAll();
        
        return produtos.stream()
                .filter(Produto::isAtivo) // Traz apenas os que não foram deletados
                .filter(p -> categoriaId == null || (p.getCategoria() != null && p.getCategoria().getId().equals(categoriaId)))
                .map(ProdutoMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
            .orElseThrow(() -> new NegocioException("Produto não encontrado com ID: " + id)); 
    }
    
    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new NegocioException("Categoria não encontrada"));

        Produto produto = Produto.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .preco(request.getPreco())
                .categoria(categoria)
                .tempoPreparoMinutos(request.getTempoPreparoMinutos() != null ? request.getTempoPreparoMinutos() : 0)
                .quantidadeDisponivel(request.getQuantidadeDisponivel())
                .limiteDiario(request.getLimiteDiario())
                .disponivel(request.getDisponivel() != null ? request.getDisponivel() : true)
                .ativo(true) // Todo produto novo nasce ativo
                .build();

        return ProdutoMapper.toResponse(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Produto não encontrado"));

        // Atualizando os campos básicos
        produto.setNome(request.getNome());
        produto.setDescricao(request.getDescricao());
        produto.setPreco(request.getPreco());
        produto.setTempoPreparoMinutos(request.getTempoPreparoMinutos());
        produto.setQuantidadeDisponivel(request.getQuantidadeDisponivel());
        
        // ---> A MÁGICA FALTANDO: GARANTIR QUE O STATUS SEJA ATUALIZADO <---
        // (Dependendo de como o Lombok gerou, pode ser getDisponivel() ou isDisponivel())
        produto.setDisponivel(request.getDisponivel()); 

        // Tratamento da Categoria
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new NegocioException("Categoria não encontrada"));
        produto.setCategoria(categoria);

        produto = produtoRepository.save(produto);
        return ProdutoMapper.toResponse(produto);
    }

    @Transactional
    public void inativar(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new NegocioException("Produto não encontrado"));
        
        produto.setAtivo(false); // Inativação Lógica (Soft Delete) para não sumir dos pedidos velhos
        produtoRepository.save(produto);
    }
}