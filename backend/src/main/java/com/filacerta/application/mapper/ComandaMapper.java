package com.filacerta.application.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.ReportingPolicy;

import com.filacerta.application.dto.request.CriarComandaRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.domain.entity.Comanda;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ComandaMapper {

	@Mappings({ @Mapping(target = "id", ignore = true), @Mapping(target = "codigo", ignore = true),
			@Mapping(target = "status", ignore = true), @Mapping(target = "valorTotal", ignore = true),
			@Mapping(target = "abertura", ignore = true), @Mapping(target = "fechamento", ignore = true),
			@Mapping(target = "createdAt", ignore = true), @Mapping(target = "comandaPedidos", ignore = true) })
	Comanda toEntity(CriarComandaRequest request);

	ComandaResponse toResponse(Comanda comanda);

	List<ComandaResponse> toResponseList(List<Comanda> comandas);
}