package com.filacerta.application.mapper;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.domain.entity.Produto;
import org.springframework.stereotype.Component;

@Component
public class ProdutoMapper {
    
    public static ProdutoResponse toResponse(Produto produto) {
        if (produto == null) return null;
        
        return ProdutoResponse.builder()
                .id(produto.getId())
                .nome(produto.getNome())
                .descricao(produto.getDescricao())
                .preco(produto.getPreco())
                .categoria(produto.getCategoria())
                .tempoPreparoMinutos(produto.getTempoPreparoMinutos())
                .build();
    }
}