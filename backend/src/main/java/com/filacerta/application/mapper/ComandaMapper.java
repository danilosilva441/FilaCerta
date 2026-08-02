package com.filacerta.application.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.filacerta.application.dto.request.CriarComandaRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.domain.entity.Comanda;

@Component
public class ComandaMapper {

    public Comanda toEntity(CriarComandaRequest request) {
        if (request == null) {
            return null;
        }

        Comanda comanda = new Comanda();
        comanda.setNomeCliente(request.getNomeCliente());
        comanda.setMesa(request.getMesa());
        return comanda;
    }

    public ComandaResponse toResponse(Comanda comanda) {
        if (comanda == null) {
            return null;
        }

        // Retorna apenas IDs dos pedidos, não o objeto completo
        List<Long> pedidoIds = null;
        if (comanda.getComandaPedidos() != null) {
            pedidoIds = comanda.getComandaPedidos().stream()
                .map(cp -> cp.getPedido().getId())
                .collect(Collectors.toList());
        }

        return ComandaResponse.builder()
            .id(comanda.getId())
            .codigo(comanda.getCodigo())
            .nomeCliente(comanda.getNomeCliente())
            .mesa(comanda.getMesa())
            .status(comanda.getStatus())
            .valorTotal(comanda.getValorTotal())
            .abertura(comanda.getAbertura())
            .fechamento(comanda.getFechamento())
            .pedidoIds(pedidoIds)  // ← Lista de IDs
            .build();
    }

    public List<ComandaResponse> toResponseList(List<Comanda> comandas) {
        if (comandas == null) {
            return null;
        }
        return comandas.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}