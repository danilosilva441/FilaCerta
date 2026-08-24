package com.filacerta.application.service;

import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.CategoriaProduto;
import com.filacerta.domain.exception.ProdutoNaoEncontradoException;
import com.filacerta.infrastructure.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public List<Produto> listarTodos() {
        return produtoRepository.findByDisponivelTrueOrderByCategoriaAscNomeAsc();
    }

    public List<Produto> listarPorCategoria(CategoriaProduto categoria) {
        return produtoRepository.findByCategoriaAndDisponivelTrueOrderByNomeAsc(categoria);
    }

    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
            .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }
}