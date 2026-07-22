package com.filacerta.application.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.domain.entity.Produto;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProdutoMapper {

	ProdutoResponse toResponse(Produto produto);

	List<ProdutoResponse> toResponseList(List<Produto> produtos);
}