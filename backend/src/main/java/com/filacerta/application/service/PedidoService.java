package com.filacerta.application.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import com.filacerta.domain.enums.FormaPagamento;
import com.filacerta.domain.enums.StatusItemPedido;
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
	
	private final SimpMessagingTemplate messagingTemplate;

	@Transactional
	public PedidoResponse criarPedido(CriarPedidoRequest request) {

		// 1. Validar caixa aberto
		CaixaDiario caixa = caixaDiarioService.buscarCaixaAberto();

		if (Boolean.TRUE.equals(caixa.getCozinhaPausada())) {
			if (request.getOrigem() == null || !request.getOrigem().name().equals("MANUAL")) {
				throw new NegocioException("A cozinha está Pausada no momento. Não é possĩvel aceitar novos pedidos.");
			}
		}
		
		// 2. Instanciar pedido com dados básicos
		Pedido pedido = new Pedido();
		pedido.setNomeCliente(request.getNomeCliente());
		pedido.setTipo(request.getTipo());
		pedido.setOrigem(request.getOrigem());

		// Garante que o pedido caia direto no radar da cozinha
		pedido.setStatus(StatusPedido.RECEBIDO);

		// ---> A LINHA QUE HAVIA SUMIDO VOLTOU AQUI <---
		pedido.setDataHoraPedido(LocalDateTime.now());

		// Salvando a forma de pagamento e status
		pedido.setFormaPagamento(
				request.getFormaPagamento() != null ? request.getFormaPagamento() : FormaPagamento.NAO_INFORMADO);

		if (request.getFormaPagamento() != null) {
			pedido.setStatusPagamento(request.getStatusPagamento());
		} else {
			pedido.setStatusPagamento(StatusPagamento.AGUARDANDO);
		}

		// 3. Gerar número sequencial do dia
		LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
		LocalDateTime fimDoDia = LocalDate.now().plusDays(1).atStartOfDay();
		Integer maxNumero = pedidoRepository.findMaxNumeroByData(inicioDoDia, fimDoDia).orElse(0);
		pedido.setNumero(maxNumero + 1);

		// 4. Processar Itens e Baixar Estoque
		for (ItemPedidoRequest itemReq : request.getItens()) {
			Produto produto = produtoService.buscarPorId(itemReq.getProdutoId());

			// Trava de Estoque
			if (produto.getQuantidadeDisponivel() != null) {
				if (produto.getQuantidadeDisponivel() < itemReq.getQuantidade()) {
					throw new NegocioException("Estoque insuficiente para o produto: " + produto.getNome());
				}
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() - itemReq.getQuantidade());
			}

			ItemPedido item = ItemPedido.builder().pedido(pedido).produto(produto).quantidade(itemReq.getQuantidade())
					.precoUnitario(produto.getPreco()).observacaoItem(itemReq.getObservacaoItem())
					.status(StatusItemPedido.PENDENTE) // Garante a tela da cozinha
					.build();

			pedido.getItens().add(item);
		}

		pedido.setCaixaDiario(caixa);

		// 5. Calcular valor total e salvar
		pedido.calcularValorTotal();
		Pedido pedidoSalvo = pedidoRepository.save(pedido);

		// AVISA A COZINHA E O CAIXA: "Chegou um pedido novo!"
        messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
		
		// 6. Retornar DTO de resposta
		return PedidoMapper.toResponse(pedidoSalvo);
	}

	@Transactional(readOnly = true)
	public List<FilaCozinhaResponse> buscarFilaCozinha() {
		// Busca pedidos que estão RECEBIDO, PREPARANDO ou PRONTO
		List<Pedido> pedidosAtivos = pedidoRepository.findAll().stream()
				.filter(p -> p.getStatus() == StatusPedido.RECEBIDO || p.getStatus() == StatusPedido.PREPARANDO
						|| p.getStatus() == StatusPedido.PRONTO) // <--- ADICIONAMOS AQUI
				.collect(java.util.stream.Collectors.toList());

		// Ordenação e Mapeamento DENTRO da transação
		return pedidosAtivos.stream()
				.sorted(java.util.Comparator.comparing(this::temHamburguer, java.util.Comparator.reverseOrder())
						.thenComparing(Pedido::getDataHoraPedido))
				.map(com.filacerta.application.mapper.PedidoMapper::toFilaCozinhaResponse)
				.collect(java.util.stream.Collectors.toList());
	}

	private boolean temHamburguer(Pedido pedido) {
		return pedido.getItens().stream()
				.anyMatch(item -> item.getProduto() != null && item.getProduto().getCategoria() != null
						&& "Hamburguer".equalsIgnoreCase(item.getProduto().getCategoria().getNome()));
	}

	@Transactional
	public void atualizarStatusItem(Long pedidoId, Long itemId, StatusItemPedido novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		ItemPedido item = pedido.getItens().stream().filter(i -> i.getId().equals(itemId)).findFirst()
				.orElseThrow(() -> new NegocioException("Item não encontrado: " + itemId));

		// --- NOVA REGRA: DEVOLUÇÃO DE ESTOQUE (Item Individual) ---
		// Se o status novo for CANCELADO e o item já não estiver cancelado
		if (novoStatus == StatusItemPedido.CANCELADO && item.getStatus() != StatusItemPedido.CANCELADO) {
			Produto produto = item.getProduto();
			if (produto.getQuantidadeDisponivel() != null) {
				produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() + item.getQuantidade());
			}
		}
		// ----------------------------------------------------------

		item.setStatus(novoStatus);

		// Se o pedido estava como RECEBIDO e alguém começou a preparar um item,
		// atualiza o pedido para PREPARANDO
		if (pedido.getStatus() == StatusPedido.RECEBIDO && novoStatus == StatusItemPedido.PREPARANDO) {
			pedido.setStatus(StatusPedido.PREPARANDO);
		}

		// Verifica se TODOS os itens do pedido estão PRONTOS
		if (pedido.todosItensProntos()) {
			pedido.setStatus(StatusPedido.PRONTO);
			pedido.setDataHoraPronto(LocalDateTime.now());
		}

		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
		
		pedidoRepository.save(pedido);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscarPorId(Long id) {
		Pedido pedido = pedidoRepository.findById(id)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + id));

		return PedidoMapper.toResponse(pedido);
	}

	@Transactional(readOnly = true)
    public List<PedidoResponse> listarPedidoPagamentoPendente() {
        return pedidoRepository.findAll().stream()
                // ---> A MÁGICA AQUI: Filtra e expulsa os cancelados da lista! <---
                .filter(p -> p.getStatus() != StatusPedido.CANCELADO)
                
                .filter(p -> p.getStatusPagamento() == StatusPagamento.AGUARDANDO 
                          || p.getStatus() == StatusPedido.PRONTO 
                          || p.getStatus() == StatusPedido.SERVIDO)
                .sorted(Comparator.comparing(Pedido::getDataHoraPedido).reversed())
                .map(PedidoMapper::toResponse)
                .collect(Collectors.toList());
    }

	@Transactional
	public void atualizarStatusPagamento(Long pedidoId, StatusPagamento novoStatus) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado" + pedidoId));

		pedido.setStatusPagamento(novoStatus);
		pedidoRepository.save(pedido);
		
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}

	@Transactional
	public void avancarStatusPedido(Long pedidoId) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		if (pedido.getStatus() == StatusPedido.PRONTO) {

			// 1. Bifurcação: Comer Aqui vs Levar
			if (String.valueOf(pedido.getTipo()).equals("COMER_AQUI")) {
				// Fica na mesa comendo, pagamento ainda pendente
				pedido.setStatus(StatusPedido.SERVIDO);
			} else {
				// Pega o lanche e vai embora, já liquida o pagamento
				pedido.setStatus(StatusPedido.ENTREGUE);
				if (pedido.getStatusPagamento() != StatusPagamento.PAGO) {
					pedido.setStatusPagamento(StatusPagamento.PAGO);
				}
			}

		} else if (pedido.getStatus() == StatusPedido.SERVIDO) {

			// 2. Cliente terminou de comer e foi ao caixa pagar
			pedido.setStatus(StatusPedido.ENTREGUE);
			if (pedido.getStatusPagamento() != StatusPagamento.PAGO) {
				pedido.setStatusPagamento(StatusPagamento.PAGO);
			}

		}

		pedidoRepository.save(pedido);
		
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}

	@Transactional
	public void cancelarPedido(Long pedidoId) {
		Pedido pedido = pedidoRepository.findById(pedidoId)
				.orElseThrow(() -> new NegocioException("Pedido não encontrado: " + pedidoId));

		// Trava de segurança: só devolve se o pedido ainda não estiver cancelado
		if (pedido.getStatus() != StatusPedido.CANCELADO) {

			// Varre todos os itens do pedido para devolver ao estoque
			for (ItemPedido item : pedido.getItens()) {
				Produto produto = item.getProduto();

				if (produto.getQuantidadeDisponivel() != null) {
					produto.setQuantidadeDisponivel(produto.getQuantidadeDisponivel() + item.getQuantidade());
				}

				// Atualiza o status do item individual para manter a tela da cozinha
				// consistente
				item.setStatus(StatusItemPedido.CANCELADO);
			}
		}

		pedido.setStatus(StatusPedido.CANCELADO);
		pedidoRepository.save(pedido);
		
		messagingTemplate.convertAndSend("/topic/pedidos", "ATUALIZOU");
	}
}