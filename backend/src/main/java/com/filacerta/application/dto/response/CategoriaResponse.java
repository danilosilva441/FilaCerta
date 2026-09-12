package com.filacerta.application.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoriaResponse {
    private Long id;
    private String nome;
}