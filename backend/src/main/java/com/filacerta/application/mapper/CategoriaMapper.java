package com.filacerta.application.mapper;

import com.filacerta.application.dto.response.CategoriaResponse;
import com.filacerta.domain.entity.Categoria;

public class CategoriaMapper {
    public static CategoriaResponse toResponse(Categoria categoria) {
        if (categoria == null) {
            return null;
        }
        return CategoriaResponse.builder()
        		.id(categoria.getId())
        		.nome(categoria.getNome())
        		.build();
    }
}