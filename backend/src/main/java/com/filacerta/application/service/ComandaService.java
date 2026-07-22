package com.filacerta.application.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CriarComandaRequest;
import com.filacerta.application.dto.response.ComandaResponse;
import com.filacerta.infrastructure.repository.ComandaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ComandaService {

	private final ComandaRepository comandaRepository;

	public ComandaResponse criarComanda(CriarComandaRequest request) {
		log.info("Criando comanda para cliente: {}", request.getNomeCliente());
		// TODO: Implementar lógica
		return null;
	}

	public ComandaResponse buscarComandaPorId(Long id) {
		log.info("Buscando comanda com ID: {}", id);
		// TODO: Implementar lógica
		return null;
	}

	public ComandaResponse buscarComandaPorCodigo(String codigo) {
		log.info("Buscando comanda com código: {}", codigo);
		// TODO: Implementar lógica
		return null;
	}

	public List<ComandaResponse> listarComandasAbertas() {
		log.info("Listando comandas abertas");
		// TODO: Implementar lógica
		return null;
	}

	public ComandaResponse fecharComanda(Long id) {
		log.info("Fechando comanda {}", id);
		// TODO: Implementar lógica
		return null;
	}

	public ComandaResponse adicionarPedidoComanda(Long comandaId, Long pedidoId) {
		log.info("Adicionando pedido {} à comanda {}", pedidoId, comandaId);
		// TODO: Implementar lógica
		return null;
	}
}