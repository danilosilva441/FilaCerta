package com.filacerta.application.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.filacerta.application.dto.request.CriarPedidoRequest;
import com.filacerta.application.dto.request.ItemPedidoRequest;
import com.filacerta.application.dto.response.FilaCozinhaResponse;
import com.filacerta.application.dto.response.PedidoResponse;
import com.filacerta.application.mapper.PedidoMapper;
import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.StatusPagamento;
import com.filacerta.domain.enums.StatusPedido;
import com.filacerta.domain.exception.NegocioException;
import com.filacerta.infrastructure.repository.PedidoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

	private final PedidoRepository pedidoRepository;
	private final ProdutoService produtoService;
	private final CaixaDiarioService caixaDiarioService;

	@Transactional
	public PedidoResponse criarPedido(CriarPedidoRequest request) {
		// 1. Validar caixa aberto
		CaixaDiario caixa = caixaDiarioService.buscarCaixaAberto();

		// 2. Instanciar pedido com dados básicos
		Pedido pedido = Pedido.builder().nomeCliente(request.getNomeCliente()).tipo(request.getTipo())
				.origem(request.getOrigem()).dataHoraPedido(LocalDateTime.now()).observacao(request.getObservacao())
				.caixaDiario(caixa).itens(new ArrayList<>()).build();

		// 3. Gerar número sequencial do dia
		LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
		LocalDateTime fimDoDia = LocalDate.now().plusDays(1).atStartOfDay();
		Integer maxNumero = pedidoRepository.findMaxNumeroByData(inicioDoDia, fimDoDia).orElse(0);
		pedido.setNumero(maxNumero + 1);

		// 4. Processar Itens
		for (ItemPedidoRequest itemReq : request.getItens()) {
			Produto produto = produtoService.buscarPorId(itemReq.getProdutoId());

			ItemPedido item = ItemPedido.builder().pedido(pedido).produto(produto).quantidade(itemReq.getQuantidade())
					.precoUnitario(produto.getPreco()) // Trava o preço no momento da compra
					.observacaoItem(itemReq.getObservacaoItem()).build();

			pedido.getItens().add(item);
		}

		// 5. Calcular valor total e salvar
		pedido.calcularValorTotal();
		Pedido pedidoSalvo = pedidoRepository.save(pedido);

		// 6. Retornar DTO de resposta
		return PedidoMapper.toResponse(pedidoSalvo);
	}

	@Transactional(readOnly = true)
	public List<FilaCozinhaResponse> buscarFilaCozinha() {
		// Busca pedidos que estão RECEBIDO ou PREPARANDO
		java.util.List<Pedido> pedidosAtivos = pedidoRepository.findAll().stream()
				.filter(p -> p.getStatus() == StatusPedido.RECEBIDO
						|| p.getStatus() == StatusPedido.PREPARANDO)
				.collect(java.util.stream.Collectors.toList());

		// Ordenação e Mapeamento DENTRO da transação
		return pedidosAtivos.stream()
				.sorted(java.util.Comparator.comparing(this::temHamburguer, java.util.Comparator.reverseOrder())
						.thenComparing(Pedido::getDataHoraPedido))
				.map(com.filacerta.application.mapper.PedidoMapper::toFilaCozinhaResponse) // Faz a conversão aqui!
				.collect(java.util.stream.Collectors.toList());
	}

	private boolean temHamburguer(Pedido pedido) {
		return pedido.getItens().stream().anyMatch(
				item -> item.getProduto().getCategoria() == com.filacerta.domain.enums.CategoriaProduto.HAMBURGUER);
	}

	@Transactional
	public void atualizarStatusItem(Long pedidoId, Long itemId,
			com.filacerta.domain.enums.StatusItemPedido novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId).orElseThrow(
				() -> new com.filacerta.domain.exception.NegocioException("Pedido não encontrado: " + pedidoId));

		ItemPedido item = pedido.getItens().stream().filter(i -> i.getId().equals(itemId)).findFirst().orElseThrow(
				() -> new com.filacerta.domain.exception.NegocioException("Item não encontrado: " + itemId));

		item.setStatus(novoStatus);

		// Se o pedido estava como RECEBIDO e alguém começou a preparar um item,
		// atualiza o pedido para PREPARANDO
		if (pedido.getStatus() == com.filacerta.domain.enums.StatusPedido.RECEBIDO
				&& novoStatus == com.filacerta.domain.enums.StatusItemPedido.PREPARANDO) {
			pedido.setStatus(com.filacerta.domain.enums.StatusPedido.PREPARANDO);
		}

		// Verifica se TODOS os itens do pedido estão PRONTOS
		if (pedido.todosItensProntos()) {
			pedido.setStatus(com.filacerta.domain.enums.StatusPedido.PRONTO);
			pedido.setDataHoraPronto(LocalDateTime.now());
		}

		pedidoRepository.save(pedido);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscarPorId(Long id) {
		Pedido pedido = pedidoRepository.findById(id)
				.orElseThrow(() -> new com.filacerta.domain.exception.NegocioException("Pedido não encontrado: " + id));

		return PedidoMapper.toResponse(pedido);
	}

	@Transactional(readOnly = true)
	public List<PedidoResponse> listarPedidoPagamentoPendente() {
		return pedidoRepository.findAll().stream().filter(p -> p.getStatusPagamento() == StatusPagamento.AGUARDANDO)
				.sorted(java.util.Comparator.comparing(Pedido::getDataHoraPedido).reversed())
				.map(com.filacerta.application.mapper.PedidoMapper::toResponse)
				.collect(java.util.stream.Collectors.toList());
	}
	
	@Transactional
	public void atualizarStatusPagamento(Long pedidoId, StatusPagamento novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado" + pedidoId));
		
		pedido.setStatusPagamento(novoStatus);
		pedidoRepository.save(pedido);
	}
}