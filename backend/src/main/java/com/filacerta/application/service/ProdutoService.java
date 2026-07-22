package com.filacerta.application.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.filacerta.application.dto.response.ProdutoResponse;
import com.filacerta.domain.enums.CategoriaProduto;
import com.filacerta.infrastructure.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProdutoService {

	private final ProdutoRepository produtoRepository;

	public List<ProdutoResponse> listarTodosProdutos() {
		log.info("Listando todos os produtos");
		// TODO: Implementar lógica
		return null;
	}

	public List<ProdutoResponse> listarProdutosPorCategoria(CategoriaProduto categoria) {
		log.info("Listando produtos da categoria: {}", categoria);
		// TODO: Implementar lógica
		return null;
	}

	public List<ProdutoResponse> listarProdutosDisponiveis() {
		log.info("Listando produtos disponíveis");
		// TODO: Implementar lógica
		return null;
	}

	public ProdutoResponse buscarProdutoPorId(Long id) {
		log.info("Buscando produto com ID: {}", id);
		// TODO: Implementar lógica
		return null;
	}
}