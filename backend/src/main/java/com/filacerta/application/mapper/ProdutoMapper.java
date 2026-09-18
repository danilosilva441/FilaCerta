package com.filacerta.application.mapper;

import org.springframework.stereotype.Component;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.domain.entity.Produto;

@Component
public class ProdutoMapper {
    
    public static ProdutoResponse toResponse(Produto produto) {
        if (produto == null) return null;
        
        return ProdutoResponse.builder()
                .id(produto.getId())
                .nome(produto.getNome())
                .descricao(produto.getDescricao())
                .preco(produto.getPreco())
                .categoria(produto.getCategoria() != null ? produto.getCategoria().getNome() : "Sem Categoria")
                .tempoPreparoMinutos(produto.getTempoPreparoMinutos())
                .quantidadeDisponivel(produto.getQuantidadeDisponivel())
                .disponivel(produto.getDisponivel())
                .ativo(produto.isAtivo())
                .versao(produto.getVersao())
                .build();
    }
}