package com.filacerta.application.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.ProdutoRequest;
import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.application.mapper.ProdutoMapper;
import com.filacerta.domain.entity.Categoria;
import com.filacerta.domain.entity.Produto;
import com.filacerta.infrastructure.repository.CategoriaRepository;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import jakarta.persistence.EntityNotFoundException;
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

    @Transactional
    public ProdutoResponse inserir(ProdutoRequest dto) {
        Produto entity = new Produto();
        copiarDtoParaEntidade(dto, entity);
        entity = produtoRepository.save(entity);
        return ProdutoMapper.toResponse(entity);
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest dto) {
        try {
            // getReferenceById é a versão moderna do getOne()
            Produto entity = produtoRepository.getReferenceById(id);
            copiarDtoParaEntidade(dto, entity);
            entity = produtoRepository.save(entity);
            return ProdutoMapper.toResponse(entity);
        } catch (EntityNotFoundException e) {
            throw new RuntimeException("Produto não encontrado: " + id);
        }
    }

    public void deletar(Long id) {
        produtoRepository.deleteById(id);
    }

    private void copiarDtoParaEntidade(ProdutoRequest dto, Produto entity) {
        entity.setNome(dto.getNome());
        entity.setDescricao(dto.getDescricao());
        entity.setPreco(dto.getPreco());
        
        Categoria categoria = categoriaRepository.getReferenceById(dto.getCategoriaId());
        entity.setCategoria(categoria);
    }
    
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
            // Caso ainda tenha a sua classe ProdutoNaoEncontradoException, pode utilizá-la aqui
            .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + id)); 
    }
}